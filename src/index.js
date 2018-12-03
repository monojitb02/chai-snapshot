const fs = require('fs');
const path = require('path');

const seperator = process.env.CHAI_SNAPSHOT_PRETTY ? '>==>>': ' > ';
const foldJson = (flatened) => {
    const folded = {};
    const buildMap = (keys, value, head) => {
        let key = keys.shift()
        if (!head) {
            head = folded;
        }
        if (!keys.length) {
            return head[key] = value;
        }
        if (!head[key]) {
            head[key] = {}
        }
        return buildMap(keys, value, head[key]);
    };
    for (flatKey in flatened) {
        let keys = flatKey.split(seperator);
        buildMap(keys, flatened[flatKey]);
    }
    return folded;
};

const flatJson = (folded) => {
    const flatened = {};
    const flatenMap = (key, value, head) => {
        let flatKey = `${head}${seperator}${key}`;
        if (!head) {
            flatKey = key;
        }
        if (key.match(/^#[0-9]+$/g)) {
            return flatened[flatKey] = value;
        }
        for (childKey in value) {
            flatenMap(childKey, value[childKey], flatKey);
        }
        return;
    };
    for (key in folded) {
        flatenMap(key, folded[key]);
    }
    return flatened;
}
const readJson = (file) => {
    if (!fs.existsSync(file)) {
        return undefined;
    }
    try {
        if (process.env.CHAI_SNAPSHOT_PRETTY) {
            return flatJson(JSON.parse(fs.readFileSync(file, { flag: "r", encoding: "utf8" })));
        }
        return JSON.parse(fs.readFileSync(file, { flag: "r", encoding: "utf8" }));
    } catch (err) {
        return undefined;
    }
}
const writeJson = (file, data) => {
    if (!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    if (process.env.CHAI_SNAPSHOT_PRETTY) {
        return fs.writeFileSync(file, JSON.stringify(foldJson(data), null, "  "), {
            encoding: "utf8",
        });
    }
    return fs.writeFileSync(file, JSON.stringify(data, null, "  "), {
        encoding: "utf8",
    });
}

module.exports = function (chai, utils) {
    utils.addProperty(chai.Assertion.prototype, 'isForced', function () {
        utils.flag(this, 'updateSnapshot', true);
    });

    utils.addMethod(chai.Assertion.prototype, "matchSnapshot", function (passedContext) {
        const actual = utils.flag(this, 'object');
        const isForced = process.env.CHAI_SNAPSHOT_UPDATE || utils.flag(this, 'updateSnapshot');
        const context = passedContext.test ? passedContext.test : passedContext
        const dir = path.dirname(context.file);
        const filename = path.basename(context.file);
        const snapshotFile = path.join(dir, "__snapshots__", filename + ".json");

        const prepareTitle = (chain) => {
            if (chain.parent && chain.parent.file && path.basename(chain.parent.file) === filename) {
                return `${prepareTitle(chain.parent)}${seperator}${chain.title}`;
            }
            return chain.title;
        };

        if (!context.matchSequence) {
            context.matchSequence = 1;
        }

        const name = `${prepareTitle(context)}${seperator}#${context.matchSequence++}`;
        let snaps;
        let expected;
        snaps = readJson(snapshotFile);

        if (snaps === undefined) {
            writeJson(snapshotFile, { [name]: actual });
            expected = actual;
        } else if (snaps[name] === undefined || isForced) {
            writeJson(snapshotFile, { ...snaps, [name]: actual });
            expected = actual;
        } else {
            expected = snaps[name]
        }

        if (actual !== null && typeof actual === "object") {
            chai.assert.deepEqual(actual, expected);
        } else {
            chai.assert.equal(actual, expected);
        }
    });
};