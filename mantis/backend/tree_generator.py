import json
from typing import Dict, Any
import google.generativeai as genai
from sqlalchemy.orm import Session
from tree_models import DiagnosticTree
from datetime import datetime, timezone

SYSTEM_PROMPT = """You are an expert diagnostic tree generator.
Based on the provided product manual text, generate a JSON decision tree for a specific symptom.
The tree must consist of nodes. Each node is either a question or a leaf (diagnosis).

Format:
{
  "root": "node_1",
  "nodes": {
    "node_1": {
      "type": "question",
      "text": "Do indicator lights turn on?",
      "options": {
        "Yes": "node_2",
        "No": "node_3"
      }
    },
    "node_3": {
      "type": "leaf",
      "diagnosis": "Power supply failure",
      "action": "1. Verify AC input.\\n2. Inspect fuse.",
      "reference": "Manual Page 42 Section 5.3",
      "media": null
    }
  }
}
"""

def get_depth(node_id: str, nodes: Dict[str, Any], visited: set) -> int:
    """Recursive helper to calculate the depth of the tree to enforce Rule 2."""
    if node_id in visited:
        return 0
    visited.add(node_id)
    
    node = nodes.get(node_id)
    if not node or node.get("type") == "leaf":
        return 0
        
    max_child_depth = 0
    for target in node.get("options", {}).values():
        max_child_depth = max(max_child_depth, get_depth(target, nodes, visited.copy()))
        
    return 1 + max_child_depth

def validate_tree(tree_data: Dict[str, Any]) -> bool:
    """
    Validate the generated diagnostic tree based on rules:
    1. Every leaf contains diagnosis, action, reference.
    2. Minimum depth >= 3 questions.
    3. No dead branches (all option targets exist in nodes).
    """
    nodes = tree_data.get("nodes", {})
    root_id = tree_data.get("root")
    if not nodes or not root_id:
        return False
        
    for node_id, node in nodes.items():
        if node.get("type") == "leaf":
            # Rule 1 Check
            if "diagnosis" not in node or "action" not in node or "reference" not in node:
                return False
        elif node.get("type") == "question":
            options = node.get("options", {})
            if not options:
                return False
            # Rule 3 Check
            for opt, target in options.items():
                if target not in nodes:
                    return False 
                    
    # Rule 2 Check
    depth = get_depth(root_id, nodes, set())
    if depth < 3:
        return False
        
    return True

def generate_and_store_tree(db: Session, product_id: int, symptom: str, manual_text: str) -> DiagnosticTree:
    """Calls Gemini to generate the tree, validates it, and stores it in the database."""
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT
        )
        prompt = f"Symptom: {symptom}\n\nManual Text:\n{manual_text}"
        response = model.generate_content(prompt)
        
        # Extract JSON from response safely
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
            
        tree_data = json.loads(text.strip())
        
        if not validate_tree(tree_data):
            raise ValueError("Generated tree failed validation rules.")
            
        tree = DiagnosticTree(
            product_id=product_id,
            symptom=symptom,
            tree_json=json.dumps(tree_data),
            status="published"
        )
        db.add(tree)
        db.commit()
        db.refresh(tree)
        return tree
    except Exception as e:
        print(f"[ERROR] Tree generation failed: {e}")
        return None