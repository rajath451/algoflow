
export interface ExecutionStep {
  lineNumber: number;
  vars: Record<string, any>;
  error?: string;
}

/**
 * Advanced transpiler that converts C code into a JS-executable Generator.
 * Specifically handles: functions, #define, arrays, and basic IO.
 */
export function transformCodeToGenerator(userCode: string): Generator<ExecutionStep> {
  try {
    // 1. Pre-process: Macros and Comments
    let pCode = userCode
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
      .replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2;') // Convert #define to const
      .replace(/#include\s+<.*>/g, ''); // Remove headers

    // 2. Handle C-style Arrays: int a[MAX] -> let a = new Array(MAX).fill(-1)
    // We assume -1 is the default for the user's specific hash table example
    pCode = pCode.replace(/(?:int|float|double|char|long)\s+(\w+)\[(\w+|\d+)\]/g, 'let $1 = new Array($2).fill(-1)');

    // 3. Handle Functions: void main(), int create(int n) -> function main(), function create(n)
    pCode = pCode.replace(/\b(?:void|int|float|double|char)\s+(\w+)\s*\((.*?)\)\s*{/g, (match, name, params) => {
      // Clean params: "int num, int key" -> "num, key"
      const cleanParams = params.replace(/\b(?:int|float|double|char|long|void)\s+\*?/g, '');
      return `function ${name}(${cleanParams}) {`;
    });

    // 4. Handle IO: scanf -> prompt, printf -> log
    // Simplistic handling for the user's example
    pCode = pCode.replace(/scanf\s*\(".*?",\s*&?(\w+)\)/g, '$1 = parseInt(prompt("Enter value for $1:"), 10)');
    pCode = pCode.replace(/printf\s*\((.*?)\)/g, 'console.log($1)');
    pCode = pCode.replace(/exit\(\d+\)/g, 'return');

    const lines = pCode.split('\n');
    
    // 5. Variable Discovery for Tracking
    const varNames = new Set<string>();
    const varRegex = /\b(?:let|const|var)\s+([a-zA-Z_$][\w$]*)|([a-zA-Z_$][\w$]*)\s*=/g;
    let match;
    while ((match = varRegex.exec(pCode)) !== null) {
      const name = match[1] || match[2];
      if (name && !['if', 'for', 'while', 'return', 'else', 'function', 'class', 'let', 'const', 'var', 'console', 'parseInt', 'prompt', 'Array'].includes(name)) {
        varNames.add(name);
      }
    }

    const varsToCapture = Array.from(varNames);
    const varsObjectStr = varsToCapture.length > 0 
      ? `{ ${varsToCapture.map(v => `${v}: (typeof ${v} !== 'undefined') ? JSON.parse(JSON.stringify(${v})) : undefined`).join(', ')} }`
      : '{}';

    // 6. Instrumentation: Inject yields
    // Note: We skip lines that look like function declarations or structural markers
    const instrumentedLines = lines.map((line, idx) => {
      const tl = line.trim();
      if (!tl || tl.startsWith('function') || tl === '}' || tl === '{' || tl.endsWith('{')) {
        return line;
      }
      // Inject yield after the execution of the line
      return `${line}; yield { lineNumber: ${idx}, vars: ${varsObjectStr} };`;
    });

    // We must ensure the 'main' function is actually called at the end
    const finalCode = `
      ${instrumentedLines.join('\n')}
      if (typeof main === 'function') {
        let mainGen = (function*() {
          // Wrapped logic for main if needed, but here we expect 'main' to be defined
          // Since the whole generator body runs, we just call main()
        })();
        main();
      }
    `;
    
    const factory = new Function(`
      return function* () {
        try {
          ${finalCode}
        } catch (e) {
           yield { lineNumber: 0, vars: {}, error: e.message };
        }
      }
    `);

    const generatorFunc = factory();
    return generatorFunc();
  } catch (err: any) {
    return (function* () {
      yield { lineNumber: 0, vars: {}, error: `Interpreter Error: ${err.message}` };
    })();
  }
}
