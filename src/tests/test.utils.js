const getElementsFromArray = (values, key) => {
    const elements = []
    values.forEach(message => {
        elements.push(message[key])
    })

    return elements
}

const exceptsForSearch = (response, expectedMids, done) => {
    expect(response.statusCode).toBe(200);


    const actualMids = getElementsFromArray(response.body.content, 'mid');
    expect(actualMids).toEqual(expectedMids);

    done();
}

module.exports = { getElementsFromArray, exceptsForSearch }