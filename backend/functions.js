// Modify console.log function to print file location
['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName];
    console[methodName] = (...args) => {
        let initiator = 'unknown place';
        try {
            throw new Error();
        } catch (e) {
            if (typeof e.stack === 'string') {
                let isFirst = true;
                for (const line of e.stack.split('\n')) {
                    const matches = line.match(/^\s+at\s+(.*)/);
                    if (matches) {
                        if (!isFirst) { // first line - current function
                            // second line - caller (what we are looking for)
                            initiator = matches[1];
                            break;
                        }
                        isFirst = false;
                    }
                }
            }
        }
        originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
    };
});

// Return <file>:<Line> whenever it is called
exports.getLineLocation = () => {

    let initiator = 'unknown place';
    try {
        throw new Error();
    } catch (e) {
        if (typeof e.stack === 'string') {
            let isFirst = true;
            for (const line of e.stack.split('\n')) {
                const matches = line.match(/^\s+at\s+(.*)/);
                if (matches) {
                    if (!isFirst) { // first line - current function
                        // second line - caller (what we are looking for)
                        initiator = matches[1];
                        break;
                    }
                    isFirst = false;
                }
            }
        }
    }
    return (`${initiator}`);
}