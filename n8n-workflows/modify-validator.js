const fs = require('fs');
const path = require('path');

const dir = __dirname;
const workflowPath = path.join(dir, '05-validator.json');
const backupPath = path.join(dir, '05-validator.backup.json');

fs.copyFileSync(workflowPath, backupPath);

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Add Fetch Contributors node after index 4 (Fetch Repo Info)
const newNode = {
  "parameters": {
    "method": "GET",
    "url": "=https://api.github.com/repos/{{ $('Fetch Repo Info').first().json.owner.login }}/{{ $('Fetch Repo Info').first().json.name }}/contributors?per_page=100",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "options": {}
  },
  "id": "fetch-contributors",
  "name": "Fetch Contributors",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1340, 200],
  "credentials": {
    "httpHeaderAuth": {
      "id": "GITHUB_CREDENTIAL_ID",
      "name": "GitHub Token"
    }
  },
  "continueOnFail": true
};

workflow.nodes.splice(5, 0, newNode);

// Shift positions of subsequent nodes
for (let i = 6; i < workflow.nodes.length; i++) {
  workflow.nodes[i].position[0] += 220;
}

// Update connections
workflow.connections['Fetch Repo Info'].main[0][0].node = 'fetch-contributors';
workflow.connections['Fetch Contributors'] = {
  "main": [[{
    "node": "fetch-contents",
    "type": "main",
    "index": 0
  }]]
};

// Update Analyze & Classify code node (now at index 6 -> 7? splice 5,0 so original 5 becomes 6, 6 becomes 7)
const analyzeIndex = workflow.nodes.findIndex(n => n.id === 'analyze');
const analyzeNode = workflow.nodes[analyzeIndex];
let code = analyzeNode.parameters.jsCode;

// Add golden ratio logic before return
const goldenLogic = `
const contributorsData = $('Fetch Contributors').first().json || [];
const contributors = Array.isArray(contributorsData) ? contributorsData : [];
const numContribs = contributors.filter(c => (c.contributions || 0) > 0).length;

const stars = repoInfo.stargazers_count || 0;
const forks = repoInfo.forks_count || 0;
const forkRatio = stars > 0 ? forks / stars : 0;
const lastCommitDate = repoInfo.pushed_at ? new Date(repoInfo.pushed_at) : new Date(0);
const daysSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
const goldenRatio = stars >= 100 && forkRatio >= 0.05 && forkRatio <= 0.20 && daysSinceLastCommit < 90 && numContribs >= 3;

`;

const returnMatch = code.match(/return\s*\[\s*\{[\s\S]*?\}\s*\];/);
if (returnMatch) {
  const beforeReturn = code.slice(0, returnMatch.index);
  const returnPart = code.slice(returnMatch.index);
  code = beforeReturn + goldenLogic + returnPart.replace(/\{([^}]*)\}/, '{ $1, golden_ratio: goldenRatio }');
} else {
  code += goldenLogic;
}

analyzeNode.parameters.jsCode = code;

// Update Insert Tool query (now index 8)
const insertIndex = workflow.nodes.findIndex(n => n.id === 'insert-tool');
const insertNode = workflow.nodes[insertIndex];
let query = insertNode.parameters.query;

// Add golden_ratio to columns and values
query = query.replace(
  /risk_level,\s*validation_status/,
  'risk_level, golden_ratio, validation_status'
);
query = query.replace(
  /'{{$json\.risk_level}}',\s*{{$json\.validation_status}}/,
  '\'{{$json.risk_level}}\', {{ $json.golden_ratio ? true : false }}, \'{{$json.validation_status}}\''
);

insertNode.parameters.query = query;

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
console.log('Modified 05-validator.json successfully');
