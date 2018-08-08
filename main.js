// class Seat {
//   section = null;
//   row = nul;
//   // the block this seat is inside
//   block;
//   // the column number of this seat
//   col;
//   isTaken = false;

//   constructor(section, row) {
//     this.section = section;
//     this.row = row;
//   }
// }

// A block that contains conjunctive seats that are the same in availability
class Block {
  constructor(row, start, length = 0) {
    this.row = row;
    this.start = start;
    this.length = length;
    this.isTaken = false;
    this.next = null;
    this.prev = null;
  }

  // index is relative to the block start point
  takeSeats(index, size = 1) {
    if (size <= 0) {
      throw new Error("Non-positive seats can not be taken");
    }

    if (size > this.length) {
      throw new Error("The lenght of the block is not enough for that size");
    }

    if (index < 0 || index + size > this.length) {
      throw new Error("the seats overflows");
    }

    if (index !== 0) {
      const prev = this.prev;
      this.prev = new Block(this.row, this.start, index);
      this.prev.next = this;
      this.prev.prev = prev;
      if (prev != null) {
        prev.next = this.prev;
      }

      // if the currnet block is the head block
      if (this === this.row.blocks) {
        this.row.blocks = this.prev;
      }
    }

    if (index + size !== this.length) {
      const next = this.next;
      this.next = new Block(
        this.row,
        this.start + index + size,
        this.length - (index + size)
      );

      this.next.next = next;
      this.next.prev = this;
      if (next != null) {
        next.prev = this.next;
      }
    }

    this.length = size;
    this.start = this.start + index;
    this.isTaken = true;
  }
}

// A row of the seat in one section
class Row {
  constructor(section, row, length = 0) {
    this.section = section;
    this.row = row;
    this.length = length;
    // initially a row contains only one block including all the seats in that row.
    this.blocks = new Block(this, 0, length);
  }

  // get the blocks that are available and longer than certain size
  getAvailableBlocks(size = 1) {
    if (size <= 0) {
      throw new Error("You should not try to get block that is smaller than 0");
    }

    const blocks = [];
    let curBlock = this.blocks;

    while (curBlock != null) {
      if (!curBlock.isTaken && curBlock.length >= size) {
        blocks.push(curBlock);
      }

      curBlock = curBlock.next;
    }

    return blocks;
  }
}

function buildSection(name) {
  const section = {
    name,
    rows: []
  };
  for (let i = 0; i < 25; i += 1) {
    section.rows.push(new Row(section, i, i * 2 + 50));
  }

  return section;
}

const database = [
  buildSection("A"),
  buildSection("B"),
  buildSection("C"),
  buildSection("D")
];

console.log(database);

function buyTickets(size = 1) {
  // try to get the ticket that is conjunction
  const tickets = [];
  let blocks = [];
  database.forEach(section => {
    section.rows.forEach(row => {
      blocks = blocks.concat(row.getAvailableBlocks(size));
    });
  });

  const block = blocks[Math.round(Math.random() * blocks.length)];
  block.takeSeats(Math.round(Math.random() * (block.length - size)), size);

  return block;
}

function draw() {
  const container = document.getElementById("seats");

  container.innerHTML = "";

  database.forEach(section => {
    const sectionDom = document.createElement("div");
    sectionDom.classList.add("section");
    sectionDom.id = section.name;

    container.appendChild(sectionDom);

    section.rows.forEach(row => {
      const rowDom = document.createElement("div");
      rowDom.classList.add("row");
      sectionDom.appendChild(rowDom);

      let block = row.blocks;
      while (block != null) {
        for (let i = 0; i < block.length; i++) {
          const seatDom = document.createElement("div");
          seatDom.classList.add("seat");

          if (block.isTaken) {
            seatDom.classList.add("taken");
          }

          rowDom.appendChild(seatDom);
        }
        block = block.next;
      }
    });
  });
}

draw();

document.getElementById("sell").addEventListener("click", () => {
  buyTickets(Math.ceil(Math.random() * 5));
  draw();
});
