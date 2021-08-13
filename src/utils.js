export const filterAsync = async (array, filterFunction) => {
    const output = []
    for(let i = 0; i < array.length; i++) {
        if(await filterFunction(array[i], i)) {
            output.push(array[i])
        }
    }
    return output
}