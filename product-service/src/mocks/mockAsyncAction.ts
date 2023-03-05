export default async function asyncAction<T>(result: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 1500);
  });
}