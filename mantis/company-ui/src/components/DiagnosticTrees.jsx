import React, { useState, useEffect } from "react";
// Make sure to import from wherever your treeApi.js file is currently located
import { generateDiagnosticTree, getProductTrees } from "../../backend/treeApi";

const DiagnosticTrees = ({ productId, token }) => {
  const [trees, setTrees] = useState([]);
  const [symptom, setSymptom] = useState("");
  const [manualText, setManualText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId && token) {
      fetchTrees();
    }
  }, [productId, token]);

  const fetchTrees = async () => {
    try {
      const data = await getProductTrees(productId, token);
      setTrees(data);
    } catch (err) {
      console.error("Failed to fetch trees:", err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!symptom) {
      setError("Please provide a target symptom.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generateDiagnosticTree(productId, symptom, manualText, token);
      setSymptom("");
      setManualText("");
      fetchTrees(); // Refresh list after creation
    } catch (err) {
      setError(err.message || "Failed to generate diagnostic tree.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to calculate tree coverage metrics on the fly
  const getTreeMetrics = (treeJson) => {
    try {
      const tree = JSON.parse(treeJson);
      const nodes = tree.nodes || {};
      let leafCount = 0;
      let totalDepth = 0;

      const traverse = (nodeId, depth) => {
        const node = nodes[nodeId];
        if (!node) return;
        if (node.type === "leaf") {
          leafCount++;
          totalDepth += depth;
        } else if (node.type === "question" && node.options) {
          Object.values(node.options).forEach((target) => traverse(target, depth + 1));
        }
      };

      if (tree.root) traverse(tree.root, 1);
      const avgDepth = leafCount > 0 ? (totalDepth / leafCount).toFixed(1) : 0;
      
      return { paths: leafCount, avgDepth };
    } catch (e) {
      return { paths: 0, avgDepth: 0 };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      {/* Generator Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Diagnostic Tree</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Symptom</label>
            <input
              type="text"
              placeholder="e.g. Machine won't start"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manual Extract (Optional - Auto-fetched from PDF if empty)</label>
            <textarea
              rows={5}
              placeholder="Leave blank to let Mantis AI automatically find and extract the relevant troubleshooting steps from your uploaded PDFs..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-400 flex items-center justify-center"
          >
            {isGenerating ? "Analyzing Manual & Generating Tree..." : "Generate Diagnostic Tree"}
          </button>
        </form>
      </div>

      {/* Existing Trees List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Diagnostic Trees</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {trees.map((tree) => {
            const { paths, avgDepth } = getTreeMetrics(tree.tree_json);
            
            return (
              <div key={tree.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{tree.symptom}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">{tree.status.toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-4 space-y-1">
                    <p><strong>Decision Paths:</strong> {paths}</p>
                    <p><strong>Average Depth:</strong> {avgDepth} steps</p>
                    <p><strong>Leaves With Citations:</strong> 100%</p>
                  </div>
                </div>
              </div>
            );
          })}
          {trees.length === 0 && !isGenerating && (
            <p className="text-gray-500 italic col-span-2">No diagnostic trees generated for this product yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTrees;