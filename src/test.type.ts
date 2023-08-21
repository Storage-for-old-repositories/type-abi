interface A {
  array_uint256_2(
    users: [
      Array<
        [
          Array<
            [{ ["age"]: [bigint, "uint", 256][0]; ["name"]: string }, "User"][0]
          >,
          2,
        ][0]
      >,
      2,
    ][0]
  ): Promise<[Array<[bigint, "uint", 256][0]>, 2][0]>;
}

const a: A = null as any;

a.array_uint256_2([
  [
    {
      age: BigInt(234),
      name: " Kirill",
    },
  ],
]);
