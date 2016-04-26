var input = '(add 22 (subtract 43 2))';
var fakeInput = '(add (add 2 1) (subtract 1 2))';


function lexer(input) {
    var current = 0;
    var tokens = [];
    var WHITE_SPACE = /[\s]/;
    var NUMBERS = /[0-9]/;
    var LETTERS = /[a-z]/i;

    while (current < input.length) {
        var char = input[current];

        if (WHITE_SPACE.test(char)) {
            current += 1;
            continue;
        }

        if (char === '(' || char === ')') {
            tokens.push({
                type: 'parenthesis',
                value: char
            })
            current += 1;
            continue;
        }

        if (NUMBERS.test(char)) {
            var value = '';
            while (NUMBERS.test(char)) {
                value += char
                current += 1;
                char = input[current];
            }
            tokens.push({
                type: 'number',
                value: value
            });
            continue;
        }

        if (LETTERS.test(char)) {
            var value = '';
            while (LETTERS.test(char)) {
                value += char
                current += 1;
                char = input[current];
            }
            tokens.push({
                type: 'name',
                value: value
            })
            continue;
        }

        throw new TypeError('I dont know what this character is: ' + char);
    }
    return tokens;
}

function parser(tokens) {
    var current = 0;

    function walk() {
        var token = tokens[current];

        if (token.type === 'number') {
            current += 1;

            return {
                type: 'NumberLiteral',
                value: token.value
            };
        }

        if (token.type === 'parenthesis') {
            if (token.value === '(') {

                current += 1;
                token = tokens[current];

                var node = {
                    type: 'CallExpression',
                    name: token.value,
                    params: []
                };

                current += 1;
                token = tokens[current];

                while (
                    (token.type !== 'parenthesis') ||
                    (token.type === 'parenthesis' && token.value !== ')')
                ) {
                    node.params.push(walk());
                    token = tokens[current];
                }

                current += 1;


                return node;

            }
        }
        throw new TypeError(token.type);
    }

    var ast = {
        type: 'Program',
        body: []
    };

    while (current < tokens.length) {
        ast.body.push(walk());
    }

    return ast;
}

function traverser(ast, visitor) {
    
    function traverseArray(array, parent) {
        array.forEach(function(child) {
          traverseNode(child, parent);
        });
    }

    function traverseNode(node, parent) {
        
        var method = visitor[node.type];

        if (method) {
            method(node, parent);
        }

        switch(node.type) {
            case 'Program':
                traverseArray(node.body, node);
                break;
            case 'CallExpression':
                traverseArray(node.params, node);
                break;
            case 'NumberLiteral':
                break;
            default:
                throw new TypeError(node.type);
        }
    }
    traverseNode(ast, null);
}

function transformer(ast) {
    // init
    var nextAst = {
        type: 'Program',
        body: []
    };
    
    // 將 ast 的 context 指向 nextAst 的 body
    ast._context = nextAst.body;

    // visitor 實作
    var visitor = {
        NumberLiteral: function (node, parent) {
            parent._context.push({
                type: 'NumberLiteral',
                value: node.value
            });
        },
        CallExpression: function (node, parent) {
            var expression = {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: node.name
                },
                arguments: []
            };

            node._context = expression.arguments;
            // the top level `CallExpressions` in JavaScript 
            // are actually statements.
            if (parent.type !== 'CallExpression') {
                expression = {
                      type: 'ExpressionStatement',
                      expression: expression
                }
            }
            parent._context.push(expression);
        }
    }

    traverser(ast, visitor);

    return nextAst;
}

function codeGenerator(node) {
    switch(node.type) {
        case 'Program':
            return node.body.map(codeGenerator)
                .join('\n');
        case 'ExpressionStatement':
            return (
                codeGenerator(node.expression) + ';'
                )
        case 'CallExpression':
            return (
                codeGenerator(node.callee)+
                '('+
                node.arguments.map(codeGenerator).join(', ')+
                ')' 
            );
        case 'Identifier':
            return node.name;
        case 'NumberLiteral':
            return node.value;
        default:
            throw new TypeError(node.type);
    }
}

function compiler(input) {
    var tokens = lexer(input);
    var ast = parser(tokens);
    var nextAst = transformer(ast);
    var output = codeGenerator(nextAst);
    return output;
}
console.log(compiler(fakeInput));
