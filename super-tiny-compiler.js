// Source:  (add 2 (subtract 4 2))
// Taget: add(2, subtract(4, 2))

var input = '(add 22 (subtract 43 2))'

function iterate(input, cb) {
    Array.prototype.forEach.call(input, cb)
}

// [{type: }]
function lexer(input) {
    var current = 0;
    var tokens = [];
    var WHITE_SPACE = /[\s]/;
    var NUMBERS = /[0-9]/;
    var LETTERS = /[a-z]/i;

    while(current < input.length) {
        var char = input[current];

        if (WHITE_SPACE.test(char)) {
            current += 1;
            continue;
        }

        if (char === '(' || char === ')') {
            tokens.push({type: 'paren', value: char})
        }
        
        if (NUMBERS.test(char)) {
            var value = '';
            while(NUMBERS.test(char)) {
                value += char
                current += 1;
                char = input[current];
            }
            tokens.push({type: 'number', value: value});
        }
        
        if (LETTERS.test(char)) {
            var value = '';
            while(LETTERS.test(char)) {
                value += char
                current += 1;
                char = input[current];
            }
            tokens.push({type: 'name', value: value})
        }

        current += 1;
    }
    return tokens;
}

var tokens = lexer(input)

console.log(tokens);