/**
 * Adds the remaining names so every franchise-decade can field a distinct
 * starting nine (C, 1B, 2B, 3B, SS, LF, CF, RF, SP).
 */
function h(name, franchise, decade, pos, tier, hof, avg, obp, slg) {
  return [name, franchise, decade, pos, tier, hof, avg, obp, slg, 0];
}

export const ROSTER_NINE = [
  // Arizona
  h('Alek Thomas', 'ari', '2020s', 'CF', 2, 0, 0.237, 0.284, 0.377),
  h('Jake McCarthy', 'ari', '2020s', 'RF', 2, 0, 0.26, 0.318, 0.38),

  // Atlanta
  h('Andy Pafko', 'atl', '1950s', 'RF', 2, 0, 0.249, 0.319, 0.396),
  h('Orlando Cepeda', 'atl', '1960s', '1B', 4, 1, 0.305, 0.356, 0.499),
  h('Sonny Jackson', 'atl', '1960s', 'SS', 1, 0, 0.251, 0.305, 0.307),
  h('Jerry Royster', 'atl', '1970s', '3B', 1, 0, 0.249, 0.316, 0.327),
  h('Ken Oberkfell', 'atl', '1980s', '3B', 2, 0, 0.278, 0.348, 0.354),
  h('Claudell Washington', 'atl', '1980s', 'RF', 2, 0, 0.278, 0.331, 0.42),

  // Baltimore
  h('Dave Philley', 'bal', '1950s', 'RF', 1, 0, 0.261, 0.327, 0.366),
  h('Curt Blefary', 'bal', '1960s', 'RF', 2, 0, 0.241, 0.347, 0.42),
  h('Lenn Sakata', 'bal', '1980s', 'SS', 1, 0, 0.226, 0.279, 0.309),
  h('John Lowenstein', 'bal', '1980s', 'RF', 2, 0, 0.254, 0.341, 0.421),
  h('Mike Bordick', 'bal', '1990s', 'SS', 2, 0, 0.26, 0.327, 0.351),
  h('Mike Devereaux', 'bal', '1990s', 'CF', 2, 0, 0.254, 0.309, 0.398),
  h('J.J. Hardy', 'bal', '2010s', 'SS', 2, 0, 0.244, 0.295, 0.388),
  h('Jorge Mateo', 'bal', '2020s', 'SS', 2, 0, 0.229, 0.275, 0.383),
  h('Austin Hays', 'bal', '2020s', 'RF', 2, 0, 0.26, 0.309, 0.434),

  // Boston
  h('Shane Victorino', 'bos', '2010s', 'RF', 2, 0, 0.267, 0.331, 0.413),

  // Cubs
  h('Don Kessinger', 'chc', '1960s', 'SS', 2, 0, 0.252, 0.314, 0.314),
  h('Bobby Murcer', 'chc', '1970s', 'RF', 3, 0, 0.274, 0.357, 0.436),
  h('Gary Matthews', 'chc', '1980s', 'LF', 3, 0, 0.281, 0.364, 0.431),
  h('Jerry Mumphrey', 'chc', '1980s', 'RF', 2, 0, 0.289, 0.353, 0.403),
  h('Starlin Castro', 'chc', '2010s', 'SS', 2, 0, 0.281, 0.32, 0.408),
  h('Kyle Schwarber', 'chc', '2010s', 'LF', 3, 0, 0.226, 0.342, 0.48),
  h('Jason Heyward', 'chc', '2010s', 'RF', 2, 0, 0.257, 0.337, 0.399),
  h('Pete Crow-Armstrong', 'chc', '2020s', 'CF', 2, 0, 0.237, 0.286, 0.407),

  // Cincinnati
  h('Tony Perez', 'cin', '1960s', '3B', 4, 1, 0.279, 0.341, 0.463),
  h('Tommy Harper', 'cin', '1960s', 'RF', 2, 0, 0.256, 0.328, 0.379),
  h('Eddie Milner', 'cin', '1980s', 'CF', 1, 0, 0.258, 0.334, 0.366),
  h('Jose Barrero', 'cin', '2020s', 'SS', 1, 0, 0.205, 0.26, 0.337),
  h('Will Benson', 'cin', '2020s', 'LF', 2, 0, 0.243, 0.335, 0.447),

  // Cleveland
  h('Vic Davalillo', 'cle', '1960s', 'CF', 2, 0, 0.279, 0.315, 0.377),
  h('Charlie Spikes', 'cle', '1970s', 'RF', 2, 0, 0.245, 0.297, 0.41),
  h('John Lowenstein', 'cle', '1970s', 'LF', 2, 0, 0.242, 0.325, 0.38),
  h('Felix Fermin', 'cle', '1980s', 'SS', 1, 0, 0.259, 0.305, 0.314),
  h('Cory Snyder', 'cle', '1980s', 'RF', 2, 0, 0.247, 0.292, 0.437),
  h('Travis Fryman', 'cle', '1990s', '3B', 3, 0, 0.274, 0.336, 0.443),
  h('David Justice', 'cle', '1990s', 'RF', 3, 0, 0.279, 0.378, 0.5),
  h('Coco Crisp', 'cle', '2000s', 'LF', 2, 0, 0.277, 0.327, 0.414),
  h('Shin-Soo Choo', 'cle', '2000s', 'RF', 3, 0, 0.288, 0.372, 0.452),
  h('Michael Bourn', 'cle', '2010s', 'CF', 2, 0, 0.266, 0.333, 0.354),

  // Colorado
  h('Gerardo Parra', 'col', '2010s', 'RF', 2, 0, 0.275, 0.325, 0.403),
  h('Raimel Tapia', 'col', '2020s', 'LF', 2, 0, 0.275, 0.321, 0.399),

  // White Sox
  h('Dave Nicholson', 'cws', '1960s', 'LF', 1, 0, 0.212, 0.318, 0.399),
  h('Darrin Jackson', 'cws', '1990s', 'RF', 2, 0, 0.249, 0.29, 0.405),

  // Detroit
  h('George Kell', 'det', '1950s', '3B', 3, 1, 0.306, 0.367, 0.414),
  h('Vic Wertz', 'det', '1950s', 'RF', 2, 0, 0.277, 0.35, 0.469),
  h('Ray Oyler', 'det', '1960s', 'SS', 1, 0, 0.175, 0.258, 0.251),
  h('Larry Herndon', 'det', '1980s', 'RF', 2, 0, 0.274, 0.323, 0.419),
  h('Nick Castellanos', 'det', '2010s', '3B', 3, 0, 0.272, 0.316, 0.458),
  h('Zach McKinstry', 'det', '2020s', '3B', 1, 0, 0.23, 0.294, 0.363),
  h('Matt Vierling', 'det', '2020s', 'RF', 2, 0, 0.257, 0.318, 0.394),

  // Houston
  h('Norm Miller', 'hou', '1960s', 'RF', 1, 0, 0.245, 0.317, 0.366),
  h('Doug Rader', 'hou', '1970s', '3B', 2, 0, 0.251, 0.328, 0.413),
  h('Bill Spiers', 'hou', '1990s', '2B', 1, 0, 0.271, 0.345, 0.369),
  h('Richard Hidalgo', 'hou', '1990s', 'RF', 2, 0, 0.269, 0.338, 0.49),
  h('Moises Alou', 'hou', '2000s', 'LF', 3, 0, 0.303, 0.369, 0.516),
  h('Jason Lane', 'hou', '2000s', 'RF', 1, 0, 0.241, 0.307, 0.433),
  h('Josh Reddick', 'hou', '2010s', 'RF', 2, 0, 0.262, 0.318, 0.436),
  h('Michael Brantley', 'hou', '2020s', 'LF', 3, 0, 0.298, 0.358, 0.437),

  // Kansas City
  h('Joe Foy', 'kc', '1960s', '3B', 2, 0, 0.248, 0.341, 0.366),
  h('Lou Piniella', 'kc', '1970s', 'LF', 3, 0, 0.291, 0.333, 0.409),
  h('Al Cowens', 'kc', '1970s', 'RF', 2, 0, 0.27, 0.317, 0.404),
  h('Jorge Soler', 'kc', '2010s', 'RF', 2, 0, 0.242, 0.328, 0.48),
  h('Adalberto Mondesi', 'kc', '2020s', 'SS', 2, 0, 0.243, 0.28, 0.408),

  // Angels
  h('Fred Lynn', 'laa', '1980s', 'RF', 3, 0, 0.283, 0.36, 0.484),
  h('Hunter Renfroe', 'laa', '2020s', 'RF', 2, 0, 0.237, 0.294, 0.479),

  // Dodgers
  h('Billy Cox', 'lad', '1950s', '3B', 2, 0, 0.262, 0.321, 0.376),
  h('Willie Davis', 'lad', '1960s', 'CF', 3, 0, 0.279, 0.311, 0.413),
  h('Rick Monday', 'lad', '1970s', 'RF', 2, 0, 0.26, 0.361, 0.425),
  h('Greg Brock', 'lad', '1980s', '1B', 2, 0, 0.248, 0.33, 0.419),
  h('Jeff Hamilton', 'lad', '1980s', '3B', 1, 0, 0.234, 0.267, 0.35),
  h('Candy Maldonado', 'lad', '1980s', 'LF', 2, 0, 0.253, 0.316, 0.409),
  h('Mike Marshall', 'lad', '1980s', 'RF', 2, 0, 0.265, 0.32, 0.437),
  h('Brett Butler', 'lad', '1990s', 'CF', 3, 0, 0.29, 0.377, 0.376),
  h('Justin Turner', 'lad', '2010s', '3B', 3, 0, 0.287, 0.361, 0.459),
  h('Yasiel Puig', 'lad', '2010s', 'RF', 3, 0, 0.277, 0.348, 0.478),
  h('Justin Turner', 'lad', '2020s', '3B', 3, 0, 0.276, 0.353, 0.43),

  // Miami
  h('Cliff Floyd', 'mia', '1990s', 'LF', 3, 0, 0.278, 0.358, 0.482),
  h('Mark Kotsay', 'mia', '1990s', 'RF', 2, 0, 0.276, 0.332, 0.404),
  h('Bryan De La Cruz', 'mia', '2020s', 'LF', 2, 0, 0.253, 0.297, 0.407),
  h('Avisail Garcia', 'mia', '2020s', 'RF', 2, 0, 0.265, 0.315, 0.427),

  // Milwaukee
  h('Ben Oglivie', 'mil', '1980s', 'LF', 3, 0, 0.273, 0.336, 0.473),
  h('Gorman Thomas', 'mil', '1980s', 'CF', 3, 0, 0.225, 0.324, 0.455),
  h('Sixto Lezcano', 'mil', '1980s', 'RF', 2, 0, 0.271, 0.36, 0.448),
  h('Garrett Mitchell', 'mil', '2020s', 'CF', 1, 0, 0.255, 0.323, 0.42),
  h('Christian Yelich', 'mil', '2020s', 'RF', 3, 0, 0.285, 0.376, 0.47),

  // Minnesota / Senators
  h('Eddie Yost', 'min', '1950s', '3B', 2, 0, 0.254, 0.394, 0.371),
  h('Jim Lemon', 'min', '1950s', 'RF', 2, 0, 0.262, 0.332, 0.46),
  h('Jim Busby', 'min', '1950s', 'CF', 1, 0, 0.262, 0.32, 0.358),
  h('Ted Uhlaender', 'min', '1960s', 'LF', 2, 0, 0.263, 0.315, 0.351),
  h('Rob Wilfong', 'min', '1970s', '2B', 1, 0, 0.248, 0.306, 0.327),
  h('Trevor Plouffe', 'min', '2010s', '3B', 2, 0, 0.24, 0.303, 0.413),

  // Mets
  h('Dave Kingman', 'nym', '1970s', 'RF', 3, 0, 0.236, 0.302, 0.478),
  h('Robin Ventura', 'nym', '1990s', '3B', 3, 0, 0.267, 0.36, 0.444),
  h('Daniel Murphy', 'nym', '2010s', '2B', 3, 0, 0.296, 0.341, 0.455),
  h('David Wright', 'nym', '2010s', '3B', 4, 0, 0.296, 0.376, 0.491),
  h('Curtis Granderson', 'nym', '2010s', 'RF', 3, 0, 0.249, 0.337, 0.465),
  h('Mark Canha', 'nym', '2020s', 'RF', 2, 0, 0.244, 0.343, 0.403),

  // Yankees
  h('Andy Carey', 'nyy', '1950s', '3B', 2, 0, 0.26, 0.326, 0.387),
  h('Mickey Mantle', 'nyy', '1960s', 'CF', 5, 1, 0.298, 0.421, 0.557),
  h('Ken Griffey', 'nyy', '1980s', 'RF', 2, 0, 0.296, 0.359, 0.431),
  h('Derek Jeter', 'nyy', '2000s', 'SS', 5, 1, 0.31, 0.377, 0.44),
  h('Chase Headley', 'nyy', '2010s', '3B', 2, 0, 0.263, 0.347, 0.399),
  h('Didi Gregorius', 'nyy', '2010s', 'SS', 2, 0, 0.261, 0.304, 0.427),
  h('Alex Verdugo', 'nyy', '2020s', 'RF', 2, 0, 0.277, 0.33, 0.416),

  // Athletics
  h('Jerry Lumpe', 'oak', '1960s', '2B', 2, 0, 0.268, 0.325, 0.366),
  h('Claudell Washington', 'oak', '1970s', 'LF', 2, 0, 0.278, 0.331, 0.42),
  h('Dave Henderson', 'oak', '1980s', 'RF', 2, 0, 0.258, 0.324, 0.436),
  h('Jed Lowrie', 'oak', '2010s', 'SS', 2, 0, 0.263, 0.337, 0.414),
  h('Seth Brown', 'oak', '2020s', 'LF', 2, 0, 0.231, 0.295, 0.436),
  h('Lawrence Butler', 'oak', '2020s', 'RF', 2, 0, 0.242, 0.304, 0.416),

  // Phillies
  h('Ted Kazanski', 'phi', '1950s', 'SS', 1, 0, 0.217, 0.286, 0.302),
  h('Rip Repulski', 'phi', '1950s', 'RF', 2, 0, 0.269, 0.323, 0.443),
  h('Tony Gonzalez', 'phi', '1960s', 'LF', 2, 0, 0.286, 0.337, 0.403),
  h('Jay Johnstone', 'phi', '1970s', 'RF', 2, 0, 0.267, 0.329, 0.394),
  h('Milt Thompson', 'phi', '1990s', 'LF', 2, 0, 0.274, 0.334, 0.377),

  // Pirates
  h('Omar Moreno', 'pit', '1970s', 'CF', 2, 0, 0.252, 0.306, 0.343),
  h('Glenn Wilson', 'pit', '1980s', 'RF', 2, 0, 0.265, 0.306, 0.394),
  h('Dave Clark', 'pit', '1990s', 'RF', 1, 0, 0.264, 0.332, 0.43),
  h('Joshua Palacios', 'pit', '2020s', 'RF', 1, 0, 0.239, 0.3, 0.38),

  // San Diego
  h('Al Ferrara', 'sd', '1960s', 'CF', 1, 0, 0.259, 0.337, 0.423),
  h('Nate Colbert', 'sd', '1970s', '1B', 3, 0, 0.243, 0.329, 0.451),
  h('Xavier Nady', 'sd', '2000s', 'RF', 2, 0, 0.272, 0.324, 0.438),
  h('Will Venable', 'sd', '2010s', 'RF', 2, 0, 0.249, 0.318, 0.403),

  // Seattle
  h('Phil Bradley', 'sea', '1980s', 'LF', 2, 0, 0.286, 0.355, 0.421),
  h('Mike Blowers', 'sea', '1990s', '3B', 2, 0, 0.257, 0.322, 0.423),
  h('Vince Coleman', 'sea', '1990s', 'LF', 2, 0, 0.264, 0.326, 0.345),
  h('Randy Winn', 'sea', '2000s', 'LF', 2, 0, 0.284, 0.343, 0.416),
  h('Michael Saunders', 'sea', '2010s', 'LF', 2, 0, 0.232, 0.306, 0.407),
  h('Austin Jackson', 'sea', '2010s', 'RF', 2, 0, 0.273, 0.333, 0.395),

  // San Francisco
  h('Candy Maldonado', 'sf', '1980s', 'RF', 2, 0, 0.253, 0.316, 0.409),
  h('Brandon Crawford', 'sf', '2020s', 'SS', 3, 0, 0.254, 0.321, 0.405),
  h('Mike Yastrzemski', 'sf', '2020s', 'RF', 2, 0, 0.24, 0.323, 0.45),

  // St. Louis
  h('Bill Virdon', 'stl', '1950s', 'CF', 2, 0, 0.267, 0.325, 0.387),
  h('Rip Repulski', 'stl', '1950s', 'RF', 2, 0, 0.269, 0.323, 0.443),
  h('Reggie Smith', 'stl', '1970s', 'RF', 3, 0, 0.287, 0.366, 0.489),
  h('George Hendrick', 'stl', '1980s', 'RF', 3, 0, 0.278, 0.329, 0.439),
  h('Ray Lankford', 'stl', '2000s', 'LF', 2, 0, 0.272, 0.364, 0.48),

  // Tampa Bay
  h('Quinton McCracken', 'tb', '1990s', 'RF', 1, 0, 0.274, 0.339, 0.375),
  h('Julio Lugo', 'tb', '2000s', 'SS', 2, 0, 0.269, 0.328, 0.389),
  h('Rocco Baldelli', 'tb', '2000s', 'RF', 2, 0, 0.278, 0.328, 0.443),
  h('Yunel Escobar', 'tb', '2010s', 'SS', 2, 0, 0.278, 0.348, 0.377),
  h('Kevin Kiermaier', 'tb', '2010s', 'CF', 2, 0, 0.246, 0.302, 0.398),
  h('Matt Joyce', 'tb', '2010s', 'RF', 2, 0, 0.242, 0.34, 0.428),
  h('Josh Lowe', 'tb', '2020s', 'RF', 2, 0, 0.246, 0.316, 0.427),

  // Texas / Senators II
  h('Fred Valentine', 'tex', '1960s', 'LF', 1, 0, 0.247, 0.326, 0.376),
  h('Bert Campaneris', 'tex', '1970s', 'SS', 3, 0, 0.259, 0.311, 0.342),
  h('Ruben Sierra', 'tex', '1990s', 'RF', 3, 0, 0.268, 0.315, 0.452),
  h('Leonys Martin', 'tex', '2010s', 'CF', 2, 0, 0.263, 0.322, 0.39),
  h('Shin-Soo Choo', 'tex', '2010s', 'RF', 3, 0, 0.275, 0.377, 0.437),
  h('Robbie Grossman', 'tex', '2020s', 'RF', 2, 0, 0.241, 0.341, 0.38),

  // Toronto
  h('Al Woods', 'tor', '1970s', 'LF', 1, 0, 0.271, 0.332, 0.39),
  h('Rick Bosetti', 'tor', '1970s', 'CF', 1, 0, 0.25, 0.297, 0.346),
  h('Candy Maldonado', 'tor', '1990s', 'RF', 2, 0, 0.253, 0.316, 0.409),
  h('Melky Cabrera', 'tor', '2010s', 'LF', 2, 0, 0.285, 0.334, 0.417),
  h('Teoscar Hernandez', 'tor', '2020s', 'RF', 3, 0, 0.264, 0.322, 0.49),

  // Washington / Expos
  h('Don Bosch', 'wsh', '1960s', 'CF', 1, 0, 0.164, 0.227, 0.22),
  h('Jim Fairey', 'wsh', '1960s', 'RF', 1, 0, 0.243, 0.3, 0.344),
  h('Larry Parrish', 'wsh', '1970s', '3B', 2, 0, 0.263, 0.317, 0.429),
  h('Mitch Webster', 'wsh', '1980s', 'RF', 2, 0, 0.263, 0.328, 0.396),
  h('Endy Chavez', 'wsh', '2000s', 'CF', 1, 0, 0.277, 0.325, 0.367),
  h('Jayson Werth', 'wsh', '2010s', 'RF', 3, 0, 0.267, 0.36, 0.454),
  h('Joey Meneses', 'wsh', '2020s', 'RF', 2, 0, 0.265, 0.312, 0.412),
];
