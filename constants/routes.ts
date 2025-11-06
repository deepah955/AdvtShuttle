export interface Route {
  id: string;
  name: string;
  color: string;
  stops: string[];
  polyline?: { lat: number; lon: number }[];
}

export const routes: Route[] = [
  {
    id: 'lh-prp',
    name: 'LH/PRP Route',
    color: '#007AFF',
    stops: ['VIT Main Gate', 'LH Block', 'Cafeteria', 'Library', 'PRP Block', 'Sports Complex', 'Hostel'],
  },
  {
    id: 'mh',
    name: 'MH Route',
    color: '#FF9500',
    stops: ['VIT Main Gate', 'MH Block', 'Auditorium', 'Parking'],
  },
];

export interface Shuttle {
  id: string;
  routeId: string;
  lat: number;
  lon: number;
  speed: number; // km/h
  bearing: number;
  driverName: string;
  vehicleNo: string;
}

export const mockShuttles: Shuttle[] = [
  {
    id: '1',
    routeId: 'lh-prp',
    lat: 12.9716,
    lon: 79.1587,
    speed: 30,
    bearing: 45,
    driverName: 'Rajesh Kumar',
    vehicleNo: 'TN01AB1234',
  },
  {
    id: '2',
    routeId: 'mh',
    lat: 12.97,
    lon: 79.155,
    speed: 35,
    bearing: 180,
    driverName: 'Amit Singh',
    vehicleNo: 'TN01EF9012',
  },
];