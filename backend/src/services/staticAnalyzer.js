// Static Code Analysis Engine
// Performs rule-based analysis for JS, Python, Java, C++

const analyzeCode = (code, language) => {
  const lines = code.split('\n');
  const findings = [];
  const metrics = {
    linesOfCode: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
    numFunctions: 0,
    numClasses: 0,
    cyclomaticComplexity: 1,
  };

  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      return analyzeJS(code, lines, findings, metrics);
    case 'python':
      return analyzePython(code, lines, findings, metrics);
    case 'java':
      return analyzeJava(code, lines, findings, metrics);
    default:
      return analyzeGeneric(code, lines, findings, metrics);
  }
};

const analyzeJS = (code, lines, findings, metrics) => {
  lines.forEach((line, i) => {
    const ln = i + 1;
    const trimmed = line.trim();

    // Count functions
    if (/function\s+\w+|=>\s*{|=\s*function/.test(line)) metrics.numFunctions++;
    // Count classes
    if (/^\s*class\s+/.test(line)) metrics.numClasses++;
    // Cyclomatic complexity
    if (/\b(if|else if|while|for|case|catch|&&|\|\|)\b/.test(line)) metrics.cyclomaticComplexity++;

    // == instead of ===
    if (/[^=!<>]==[^=]/.test(line) && !/\/\//.test(trimmed)) {
      findings.push({ severity: 'warning', category: 'bug', issue: 'Use === instead of ==', explanation: 'The == operator performs type coercion which can lead to unexpected results. Use === for strict equality.', suggested_fix: line.replace(/([^=!<>])==([^=])/g, '$1===$2').trim(), line_number: ln, code_snippet: trimmed });
    }
    // var usage
    if (/^\s*var\s+/.test(line)) {
      findings.push({ severity: 'warning', category: 'style', issue: 'Avoid using var', explanation: 'var has function scope and can cause hoisting issues. Use let or const instead.', suggested_fix: line.replace(/\bvar\b/, 'const').trim(), line_number: ln, code_snippet: trimmed });
    }
    // console.log in production
    if (/console\.log/.test(line) && !/\/\//.test(trimmed)) {
      findings.push({ severity: 'info', category: 'style', issue: 'Remove console.log before production', explanation: 'Leaving console.log statements in production code can expose sensitive information and clutter logs.', suggested_fix: '// Remove or replace with proper logging', line_number: ln, code_snippet: trimmed });
    }
    // Missing error handling in async
    if (/async\s+function|async\s*\(/.test(line) && !code.includes('try') && !code.includes('.catch')) {
      findings.push({ severity: 'warning', category: 'bug', issue: 'Async function missing error handling', explanation: 'Async functions should use try/catch or .catch() to handle promise rejections.', suggested_fix: 'Wrap async code in try { ... } catch (error) { ... }', line_number: ln, code_snippet: trimmed });
    }
    // TODO/FIXME comments
    if (/\b(TODO|FIXME|HACK|XXX)\b/.test(line)) {
      findings.push({ severity: 'info', category: 'documentation', issue: `Unresolved ${line.match(/TODO|FIXME|HACK|XXX/)[0]} comment`, explanation: 'Unresolved TODO/FIXME comments should be addressed before shipping to production.', suggested_fix: 'Resolve or create a ticket for this issue', line_number: ln, code_snippet: trimmed });
    }
    // Long lines
    if (line.length > 120) {
      findings.push({ severity: 'info', category: 'style', issue: 'Line exceeds 120 characters', explanation: 'Long lines reduce readability. Consider breaking this line into multiple lines.', suggested_fix: 'Break into multiple lines', line_number: ln, code_snippet: trimmed.substring(0, 60) + '...' });
    }
    // eval() usage
    if (/\beval\s*\(/.test(line)) {
      findings.push({ severity: 'critical', category: 'security', issue: 'Dangerous use of eval()', explanation: 'eval() executes arbitrary code and is a major security risk. It can allow code injection attacks.', suggested_fix: 'Remove eval() and use safer alternatives like JSON.parse() for parsing JSON', line_number: ln, code_snippet: trimmed });
    }
    // innerHTML
    if (/\.innerHTML\s*=/.test(line)) {
      findings.push({ severity: 'warning', category: 'security', issue: 'Potential XSS via innerHTML', explanation: 'Setting innerHTML directly can lead to XSS attacks if the content includes user input.', suggested_fix: 'Use textContent instead, or sanitize the HTML before inserting', line_number: ln, code_snippet: trimmed });
    }
    // Empty catch
    if (/catch\s*\(\w+\)\s*\{\s*\}/.test(line)) {
      findings.push({ severity: 'warning', category: 'bug', issue: 'Empty catch block silences errors', explanation: 'Empty catch blocks hide errors making debugging difficult.', suggested_fix: 'Add error handling: console.error(error) or throw error', line_number: ln, code_snippet: trimmed });
    }
  });

  return { findings, metrics };
};

const analyzePython = (code, lines, findings, metrics) => {
  lines.forEach((line, i) => {
    const ln = i + 1;
    const trimmed = line.trim();

    if (/^def\s+/.test(trimmed)) metrics.numFunctions++;
    if (/^class\s+/.test(trimmed)) metrics.numClasses++;
    if (/\b(if|elif|while|for|except|and|or)\b/.test(line)) metrics.cyclomaticComplexity++;

    // print statements (Python 2 style)
    if (/^print\s+[^(]/.test(trimmed)) {
      findings.push({ severity: 'warning', category: 'style', issue: 'Python 2 print statement detected', explanation: 'print is a function in Python 3. Use print() with parentheses.', suggested_fix: trimmed.replace(/^print\s+(.*)/, 'print($1)'), line_number: ln, code_snippet: trimmed });
    }
    // Bare except
    if (/^\s*except\s*:/.test(line)) {
      findings.push({ severity: 'warning', category: 'bug', issue: 'Bare except clause catches all exceptions', explanation: 'Bare except: catches all exceptions including SystemExit and KeyboardInterrupt. Specify the exception type.', suggested_fix: 'except Exception as e:', line_number: ln, code_snippet: trimmed });
    }
    // mutable default argument
    if (/def\s+\w+\s*\([^)]*=\s*[\[\{]/.test(line)) {
      findings.push({ severity: 'critical', category: 'bug', issue: 'Mutable default argument', explanation: 'Using mutable objects (lists, dicts) as default arguments is a common Python bug. The default is shared across all calls.', suggested_fix: 'Use None as default and create the mutable object inside the function', line_number: ln, code_snippet: trimmed });
    }
    // == None instead of is None
    if (/==\s*None/.test(line)) {
      findings.push({ severity: 'warning', category: 'style', issue: 'Use "is None" instead of "== None"', explanation: 'In Python, None comparisons should use "is" not "==".', suggested_fix: line.replace(/==\s*None/, 'is None').trim(), line_number: ln, code_snippet: trimmed });
    }
    // TODO comments
    if (/\b(TODO|FIXME|HACK)\b/.test(line)) {
      findings.push({ severity: 'info', category: 'documentation', issue: `Unresolved ${line.match(/TODO|FIXME|HACK/)[0]} comment`, explanation: 'Address this before production.', suggested_fix: 'Resolve the issue', line_number: ln, code_snippet: trimmed });
    }
    // Missing docstring
    if (/^def\s+\w+/.test(trimmed) && i + 1 < lines.length && !lines[i + 1].trim().startsWith('"""') && !lines[i + 1].trim().startsWith("'''")) {
      findings.push({ severity: 'info', category: 'documentation', issue: 'Function missing docstring', explanation: 'Functions should have docstrings to document their purpose, parameters, and return value.', suggested_fix: 'Add """Description of function""" as the first line of the function body', line_number: ln, code_snippet: trimmed });
    }
  });

  return { findings, metrics };
};

const analyzeJava = (code, lines, findings, metrics) => {
  lines.forEach((line, i) => {
    const ln = i + 1;
    const trimmed = line.trim();

    if (/\b(public|private|protected)\s+\w+\s+\w+\s*\(/.test(line)) metrics.numFunctions++;
    if (/\bclass\s+\w+/.test(line)) metrics.numClasses++;
    if (/\b(if|else if|while|for|case|catch|&&|\|\|)\b/.test(line)) metrics.cyclomaticComplexity++;

    // System.out.println
    if (/System\.out\.print/.test(line)) {
      findings.push({ severity: 'info', category: 'style', issue: 'Remove System.out.println in production', explanation: 'Use a proper logging framework like SLF4J/Log4j instead of println.', suggested_fix: 'logger.info("message");', line_number: ln, code_snippet: trimmed });
    }
    // Empty catch
    if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(line)) {
      findings.push({ severity: 'warning', category: 'bug', issue: 'Empty catch block', explanation: 'Empty catch blocks silence exceptions making debugging impossible.', suggested_fix: 'Log or handle the exception: e.printStackTrace() or logger.error()', line_number: ln, code_snippet: trimmed });
    }
    // == for String comparison
    if (/"\s*==\s*"|==\s*"/.test(line)) {
      findings.push({ severity: 'critical', category: 'bug', issue: 'String comparison using ==', explanation: 'In Java, == compares object references, not content. Use .equals() for string comparison.', suggested_fix: 'Use str1.equals(str2) instead of str1 == str2', line_number: ln, code_snippet: trimmed });
    }
    // Null pointer risk
    if (/\w+\.get\(\d+\)/.test(line) && !code.includes('null check')) {
      findings.push({ severity: 'info', category: 'bug', issue: 'Possible NullPointerException', explanation: 'Accessing list elements without null check may cause NullPointerException.', suggested_fix: 'Add null check before accessing the element', line_number: ln, code_snippet: trimmed });
    }
  });

  return { findings, metrics };
};

const analyzeGeneric = (code, lines, findings, metrics) => {
  lines.forEach((line, i) => {
    const ln = i + 1;
    const trimmed = line.trim();
    if (/\b(TODO|FIXME|HACK)\b/.test(line)) {
      findings.push({ severity: 'info', category: 'documentation', issue: `Unresolved ${line.match(/TODO|FIXME|HACK/)[0]}`, explanation: 'Address this comment before production.', suggested_fix: 'Resolve the issue', line_number: ln, code_snippet: trimmed });
    }
    if (line.length > 150) {
      findings.push({ severity: 'info', category: 'style', issue: 'Very long line', explanation: 'Lines over 150 chars reduce readability.', suggested_fix: 'Break into multiple lines', line_number: ln, code_snippet: trimmed.substring(0, 60) + '...' });
    }
  });
  return { findings, metrics };
};

module.exports = { analyzeCode };
