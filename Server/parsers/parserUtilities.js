var getLineValue = function (line, regex) {
    return line.replace(line.match(regex)[0] + ':', "").trim()
}

module.exports.getLineValue = getLineValue;