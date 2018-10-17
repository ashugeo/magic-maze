## Encoding a tile's data

Every tile is made of 16 cells, which have 4 possible walls (top, bottom, right & left) and may hold items and/or escalators.

That data is encoded using 4 bits (in base 16) for every cell, resulting in a 64-character long string for the whole tile.

When decoding that string, it gets split into 16 blocks of 4 characters each. The first two characters of a block represent the walls schema of the cell, the 3rd one tells us the item, and the 4th one is used for escalators.

### First two bits: walls

The first two bits get converted to a 4-digit number in base 3. Every digit of that 4-digit number corresponds to a specific wall. We start from the top and go clockwise: top, right, bottom, left.

nth digit | wall
- | -
1 | top
2 | right
3 | bottom
4 | left

The value of that digit (0, 1 or 2) corresponds to the state of a wall.

Value | wall state
- | -
0 | no wall
1 | wall
2 | orange wall

Here is a base 10 to base 3 cheatsheet. It shows the index of every possible walls schema.

First two bits | Walls schema
- | -
00 | 0000
01 | 0001
02 | 0002
03 | 0010
04 | 0011
05 | 0012
06 | 0020
07 | 0021
08 | 0022
09 | 0100
10 | 0101
11 | 0102
12 | 0110
13 | 0111
14 | 0112
15 | 0120
16 | 0121
17 | 0122
18 | 0200
19 | 0201
20 | 0202
21 | 0210
22 | 0211
23 | 0212
24 | 0220
25 | 0221
26 | 0222
27 | 1000
28 | 1001
29 | 1002
30 | 1010
31 | 1011
32 | 1012
33 | 1020
34 | 1021
35 | 1022
36 | 1100
37 | 1101
38 | 1102
39 | 1110
40 | 1111
41 | 1112
42 | 1120
43 | 1121
44 | 1122
45 | 1200
46 | 1201
47 | 1202
48 | 1210
49 | 1211
50 | 1212
51 | 1220
52 | 1221
53 | 1222
54 | 2000
55 | 2001
56 | 2002
57 | 2010
58 | 2011
59 | 2012
60 | 2020
61 | 2021
62 | 2022
63 | 2100
64 | 2101
65 | 2102
66 | 2110
67 | 2111
68 | 2112
69 | 2120
70 | 2121
71 | 2122
72 | 2200
73 | 2201
74 | 2202
75 | 2210
76 | 2211
77 | 2212
78 | 2220
79 | 2221
80 | 2222

*Example (from tile 1A)*

```
Tile string:    '31i02700[…]'
First block:    '31i0'
First two bits:  31
=> Schema:       1011

Top wall:        1 (wall)
Right wall:      0 (no wall)
Left wall:       1 (wall)
Bottom wall:     1 (wall)
```

### 3rd bit: item

The third bit corresponds to the item that a cell may hold. Some of them are color-specific, others aren't. All of them are listed in the table below.

3rd bit | item | color
- | - | -
0 | no item | -
1 | gate | green
2 | gate | orange
3 | gate | purple
4 | gate | yellow
5 | vortex | green
6 | vortex | orange
7 | vortex | purple
8 | vortex | yellow
9 | article | green
a | article | orange
b | article | purple
c | article | yellow
d | exit | green
e | exit | orange
f | exit | purple
g | exit | yellow
h | enter | -
i | time | -
j | crystal | -
k | camera | -

*Example (from tile 1A)*

```
Tile string:    '31i02700[…]'
First block:    '31i0'
3rd bit:           i
=> Item:         time
```

### 4th bit: escalator

The fourth bit is used for escalators. Since a cell can have both an item and an escalator end, we need a new bit for that. It tells us which cell the escalator has to go to (starting from the current cell).

4th bit | coordinates
- | -
0 | no escalator
1 | {x: 0, y: 0}
2 | {x: 0, y: 1}
3 | {x: 0, y: 2}
4 | {x: 0, y: 3}
5 | {x: 1, y: 0}
6 | {x: 1, y: 1}
7 | {x: 1, y: 2}
8 | {x: 1, y: 3}
9 | {x: 2, y: 0}
a | {x: 2, y: 1}
b | {x: 2, y: 2}
c | {x: 2, y: 3}
d | {x: 3, y: 0}
e | {x: 3, y: 1}
f | {x: 3, y: 2}
g | {x: 3, y: 3}

*Example (from tile 15)*
```
Tile string:    '370a4000[…]'
First block:    '370a'
4th bit:            a
=> Escalator:    {x: 2, y: 1}
```
