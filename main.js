"use strict";
const SPACES = 5;
let area = "";

function load(ar) {
    area = ar;
}

function clearArea() {
    resetStatus();
    area.value = "";
}

function runAll() {
    clearArea();
    navigator.clipboard.readText()
        .then(clipText => area.value = clipText)
        .catch(err => clipboardError(err))
        .finally(() => {
            decodeArea();
            buildCheat();
            valueCheat();
            valueMaxCheat();
            craftCheat();
            swarmCheat();
            madCheat();
            govCheat();
            garrisonCheat();
            encodeArea();
            copyClipboard();
        });
}

function decodeArea() {
    let decodeStr = LZString.decompressFromBase64(area.value.replace(/\s+/g, ""));
    let formatted = formatLikeJSON(decodeStr);

    area.value = formatted;
}

function encodeArea() {
    let data = area.value.trim();
    data = formatLikeJSON(data);

    area.value = LZString.compressToBase64(data);
}

function pasteClipboard() {
    resetStatus();

    navigator.clipboard.readText()
        .then(clipText => area.value = clipText)
        .catch(err => clipboardError(err));
}

function copyClipboard() {
    resetStatus();

    navigator.clipboard.writeText(area.value)
        .then(() => {
            document.getElementById("clipboardStatus").classList.add("fade");
            document.getElementById("clipboardStatus").innerHTML = 'Copied!';
        })
        .catch(err => clipboardError(err));
}

function buildCheat() {
    let buildSel = document.getElementById("buildingSelect");
    let amount = buildSel.options[buildSel.selectedIndex].value;

    let lowerBound = "[1-9]";
    for (const radio of document.getElementsByName("minBuildings")) {
        if (radio.checked) {
            lowerBound = (radio.value === '2' ? "[2-9]" : lowerBound);
            break;
        }
    }

    let upperBound = "";
    for (const bound of document.getElementsByName("unlessAlready")) {
        if (bound.checked) {
            if (bound.value === '1') {
                upperBound = "|(?!0)\\d\\d";
            } else if (bound.value === '2') {
                upperBound = "|(?!0)\\d\\d\\d?";
            }
            break;
        }
    }

    let findStr = `"count": (${lowerBound}${upperBound}),`;
    let regex = new RegExp(findStr, 'g');
    let replaceStr = `"count": ${amount},`;

    area.value = area.value.replace(regex, replaceStr);

    if (document.getElementById("allOn").checked) {
        regex = /(\d*)(,\r*\W*"on": )(\d*)(,)/g;
        area.value = area.value.replace(regex, '$1$2$1$4');
    }
}

function valueCheat() {
    let valSel = document.getElementById("valueSelect");
    let amount = valSel.options[valSel.selectedIndex].value;

    let regex = /"amount": [1-9]\d*\.*\d*,/g;
    let replaceStr = `"amount": ${amount},`;

    area.value = area.value.replace(regex, replaceStr);
}

function valueMaxCheat() {
    let jdata = getTextareaAsJSON();

    for (const key in jdata.resource) {
        if (jdata.resource.hasOwnProperty(key)) {
            const res = jdata.resource[key];
            if (res.max && res.max > 0) {
                res.amount = res.max;
            }
        }
    }

    putJSONInTextarea(jdata);
}

function madCheat() {
    let jdata = getTextareaAsJSON();

    jdata.civic.mad.display = true;

    putJSONInTextarea(jdata);
}

function govCheat() {
    let jdata = getTextareaAsJSON();

    for (let i = 0; i < 3; i++) {
        let gov = jdata.civic.foreign[`gov${i}`];
        gov.mil = 1;
        gov.eco = 160;
        gov.spy = 5;
        gov.unrest = 75;
        gov.hstl = 1;
    }

    putJSONInTextarea(jdata);
}

function craftCheat() {
    let jdata = getTextareaAsJSON();

    jdata.resource.Plywood.amount = 5000000000;
    jdata.resource.Brick.amount = 5000000000;
    jdata.resource.Wrought_Iron.amount = 5000000000;
    jdata.resource.Sheet_Metal.amount = 5000000000;
    jdata.resource.Mythril.amount = 5000000000;
    jdata.resource.Aerogel.amount = 5000000000;
    jdata.resource.Nanoweave.amount = 5000000000;

    putJSONInTextarea(jdata);
}

function coupCheat() {
    let jdata = getTextareaAsJSON();
    let valSel = document.getElementById("coupSelect");
    let govType = valSel.options[valSel.selectedIndex].value;

    jdata.civic.govern.type = govType;

    putJSONInTextarea(jdata);
}

function swarmCheat() {
    let jdata = getTextareaAsJSON();

    if(jdata.space.swarm_control) {
        jdata.space.swarm_satellite.count = jdata.space.swarm_control.s_max;
    }

    putJSONInTextarea(jdata);
}

function garrisonCheat() {
    let jdata = getTextareaAsJSON();

    jdata.civic.garrison.workers = jdata.civic.garrison.max;

    putJSONInTextarea(jdata);
}

/* --------------- Helper functions -------------------- */
function reportError(err, msg) {
    resetStatus();
    msg = msg ? msg : err.message;
    clipboardError(err, msg);
}

function formatLikeJSON(data) {
    try {
        let json = JSON.parse(data);
        return JSON.stringify(json, null, SPACES);
    } catch (err) {
        reportError(err, "JSON error");
        return data;
    }
}

function getTextareaAsJSON() {
    let data = area.value;
    try {
        return JSON.parse(data);
    } catch (error) {
        reportError(error, "Input error");
        return data;
    }
}

function putJSONInTextarea(json) {
    let jStr = JSON.stringify(json, null, SPACES);

    area.value = jStr;
}

function resetStatus() {
    document.getElementById("clipboardStatus").className = 'subtitle is-6';
    document.getElementById("clipboardStatus").innerHTML = "";
}

function clipboardError(err, msg) {
    document.getElementById("clipboardStatus").classList.add("has-text-danger", "fade", "long");
    document.getElementById("clipboardStatus").innerHTML = msg ? msg : "Clipboard error!";
    // console.error(err);
}
