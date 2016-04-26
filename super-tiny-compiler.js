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
    
}

function compiler(input) {
    console.log('Input: ', input);
    var tokens = lexer(input);
    console.log(tokens.length);
    console.log('Tokens:', tokens);
    var ast = parser(tokens);
    console.log("AST:");
    console.log(ast);
    console.log(ast.body[0].params);
}

compiler(fakeInput);