-- ==============================================================================
-- ICT251 Activity 7: Backend Development - Mulungushi University
-- Project: Community Clean Up Requests
-- File: seed.sql
-- Description: Inserts at least eight realistic initial community clean up records.
-- ==============================================================================

INSERT INTO records (title, category, description, status) VALUES
(
  'Great North Road Litter Sweep',
  'Litter Cleanup',
  'Community volunteers clearing discarded plastic bottles, food wrappers, and cardboard debris along pedestrian walkways near the campus gate.',
  'Completed'
),
(
  'Mulungushi Riverbank Plastic Extraction',
  'Waterway Cleanup',
  'Removing floating plastic containers, discarded polythene bags, and debris along the riverbank to restore aquatic habitats.',
  'In progress'
),
(
  'Kabwe Central Market Drain Unblocking',
  'Drainage Clearance',
  'Unblocking primary storm drainage trenches filled with silt, organic refuse, and packaging waste to prevent monsoon street flooding.',
  'Pending'
),
(
  'Town Centre Public Park Turf Restoration',
  'Park Maintenance',
  'Raking fallen leaves, removing broken tree branches, and emptying overflowing community waste receptacles in the recreation grounds.',
  'Completed'
),
(
  'Old Bus Terminus Rubbish Clearing',
  'Public Transit Zone',
  'Sweeping commuter waiting shelters and collecting discarded beverage tins, paper bags, and litter around loading bays.',
  'Pending'
),
(
  'Community Clinic Perimeter Debris Pick',
  'Health Facility Care',
  'Clearing overgrown brush, weeds, and windblown litter surrounding the perimeter fence of the local health post.',
  'In progress'
),
(
  'Civic Centre Courtyard Tidying Drive',
  'Civic Grounds',
  'Power-sweeping walkway tiles, pruning untamed hedges, and picking litter in the central public square.',
  'Completed'
),
(
  'Railway Reserve Illegal Dump Remediation',
  'Illegal Dumping',
  'Clearing bulk discarded concrete rubble, scrap tires, and household refuse unlawfully dumped near the railway access road.',
  'Pending'
);
