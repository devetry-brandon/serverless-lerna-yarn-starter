export function Mock<T>(instanceToMock: T): jest.Mocked<T> {
    const mockedObj = {};

    getMethods(instanceToMock).forEach(method => {
        mockedObj[method] = jest.fn();
    });

    return mockedObj as jest.Mocked<T>;
}

function getMethods(obj: any): string[] {
    let properties = new Set();
    let currentObj = obj;

    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))

    return [...properties.keys()] as string[];
}