// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.2 <0.9.0;

struct User {
    uint age;
    string name;
}

struct Group {
    string name;
    User[] users;
}

contract ForTyping {
    enum Number {
        One,
        Two,
        Three
    }

    uint256 number;
    uint256[] items;
    User[] users;

    function tuple_uint256_2(
        User[2] memory users
    ) public view returns (uint256, uint256) {
        return (number, 2);
    }

    function tuple_uint256_2_with_name(
        User memory user
    ) public view returns (uint256 first, uint256 dota2) {
        return (number, 2);
    }

    function array_uint256_2(
        User[2][2] memory users
    ) public view returns (uint256[2] memory) {
        User memory u1 = users[0][0];
        return [number, number];
    }

    function array_uint256_2_with_name()
        public
        view
        returns (uint256[2] memory withNaMe)
    {
        return [number, number];
    }

    function array_uint256_n() public view returns (uint256[] memory) {
        return items;
    }

    function array_uint256_tuple()
        public
        pure
        returns (User memory, User memory)
    {
        User memory user = User(1, "hi");
        return (user, user);
    }

    function array_uint256_tuple_with_name()
        public
        pure
        returns (User[2] memory u0, User memory wows, User memory)
    {
        User memory user = User(1, "hi");
        return ([user, user], user, user);
    }

    function array_uint256_tuple_()
        public
        view
        returns (User[] memory, User memory)
    {
        User memory user = User(1, "hi");
        return (users, user);
    }

    function array_uint256_tuple_(
        uint104[][][] memory numbers,
        uint104[2][3][5] memory indexs
    ) public view returns (User[] memory, User memory badboy) {
        User memory user = User(1, "hi");
        return (users, user);
    }

    function group_prepare(
        Group[] memory groups
    ) public pure returns (Group[] memory success, Group[] memory failed) {
        return (groups, groups);
    }

    function multituples()
        public
        view
        returns (uint112[2] memory, string memory)
    {
        return ([uint112(2), 2], "hello");
    }

    function voids() public {}

    function func0() public view returns (bytes21[3][2] memory, string memory) {
        bytes21 x = "1";
        bytes
            memory y = "2234444444444444444444444444444444444444444444444444444444444";
        return ([[x, x, x], [x, x, x]], "hello");
    }

    function enums(
        uint[2][][2] memory x,
        uint[][2][] memory y
    ) public view returns (Number, Number) {
        return (Number.One, Number.Three);
    }
}
