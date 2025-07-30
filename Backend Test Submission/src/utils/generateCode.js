module.exports = async () => {
  const { nanoid } = await import("nanoid");
  return nanoid(6);
};
