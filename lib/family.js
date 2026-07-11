// The full family roster. Update this list any time someone joins the family
// (new spouse, new baby, etc.) — everyone listed here can be picked from the
// name dropdown when submitting an event.

export const FAMILY = [
  {
    generation: "Generation 1",
    members: ["Linda Peterson"],
  },
  {
    generation: "Generation 2",
    members: [
      "Millie Nikopoulos",
      "George Nikopoulos",
      "Ginny Tuite",
      "Sean Tuite",
      "Angela Jorgensen",
      "Will Peterson",
      "Deb Peterson",
      "Dave Peterson",
      "Bobbie Peterson",
      "Margaret FiveCrows",
      "Jeremy FiveCrows",
    ],
  },
  {
    generation: "Generation 3",
    members: [
      "Xanthea Nikopoulos",
      "Marika Ouzounian",
      "Yesaiah Ouzounian",
      "Athena Nikopoulos",
      "Thomas Tuite",
      "Anna Tuite",
      "Livi Kay",
      "Kaden Murphey",
      "Oskar Jorgensen",
      "Liz Peterson",
      "Mike Peterson",
      "Lucy FiveCrows",
      "Henry FiveCrows",
      "Esther Peterson",
      "Everette Peterson",
      "Easton Peterson",
    ],
  },
  {
    generation: "Generation 4",
    members: ["Bronx Murphey", "Zoey Murphey", "Connie Ouzounian"],
  },
];

export const ALL_NAMES = FAMILY.flatMap((g) => g.members);
