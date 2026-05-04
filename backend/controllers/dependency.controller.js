import Repo from "../models/repo.model.js";
import File from "../models/file.model.js";
import Dependency from "../models/dependency.model.js";

const extractImports = (content, fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const imports = [];

  if (["js", "jsx", "ts", "tsx"].includes(ext)) {
    const esRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = esRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = cjsRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  if (ext === "py") {
    const pyRegex1 = /^import\s+([\w.]+)/gm;
    let match;
    while ((match = pyRegex1.exec(content)) !== null) {
      imports.push(match[1]);
    }
    const pyRegex2 = /^from\s+([\w.]+)\s+import/gm;
    while ((match = pyRegex2.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }

  return imports;
};

export const generateGraph = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    if (req.userId !== repo.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const allFiles = await File.find({ repoId });

    await Dependency.deleteMany({ repoId });

    const allDependencies = [];
    for (const file of allFiles) {
      const imports = extractImports(file.content, file.fileName);

      const dependencies = imports.map((imp) => ({
        importedFilePath: imp,
        importedFileName: imp.split("/").pop(),
        importType:
          imp.startsWith(".") || imp.startsWith("/") ? "local" : "external",
      }));
      allDependencies.push({
        repoId,
        userId: req.userId,
        fileId: file._id,
        dependencies,
      });
    }
    await Dependency.insertMany(allDependencies);

    return res.status(200).json({
      success: true,
      message: "Dependency graph generated successfully",
      totalFiles: allFiles.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "generateGraph server error",
    });
  }
};

export const getGraph = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const graph = await Dependency.find({ repoId }).populate(
      "fileId",
      "fileName filePath",
    );

    return res.status(200).json({
      success: true,
      message: "Graph found",
      graph,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "graph server error",
    });
  }
};

export const getNodeDependencies = async (req, res) => {
  try {
    const { repoId, fileId } = req.params;

    const repo = await Repo.findById(repoId);
    const file = await File.findById(fileId);

    if (!repo || !file) {
      return res.status(404).json({
        success: false,
        message: "repo or file not found",
      });
    }
    const nodeGraph = await Dependency.findOne({ repoId, fileId });

    return res.status(200).json({
      success: true,
      message: "repoFile found",
      nodeGraph,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "nodeGraph server error",
    });
  }
};
