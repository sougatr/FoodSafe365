const Module = require('module');
const path = require('path');
const fs = require('fs');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const sub = request.slice(2);
    const distDir = process.env.TEST_DIST_DIR || '.data/test_s5f_dist';
    const distTarget = path.resolve(process.cwd(), distDir, sub);
    const srcTarget = path.resolve(process.cwd(), sub);
    
    // Check if distTarget exists or file with extension exists
    return originalResolve.call(this, distTarget, parent, isMain, options);
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
