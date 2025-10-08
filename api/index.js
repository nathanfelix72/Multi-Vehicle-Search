const fs = require("fs");
const path = require("path");

let listings;
try {
  const listingsPath = path.join(process.cwd(), "listings.json");
  listings = JSON.parse(fs.readFileSync(listingsPath, "utf8"));
} catch (error) {
  console.error("Error loading listings:", error);
  listings = [];
}

function canFitVehicles(listing, vehicles) {
  const vehicleWidth = 10;

  const canFitNormalOrientation = vehicles.every((vehicleType) => {
    return (
      vehicleType.length <= listing.length && vehicleWidth <= listing.width
    );
  });

  const canFitRotatedOrientation = vehicles.every((vehicleType) => {
    return (
      vehicleType.length <= listing.width && vehicleWidth <= listing.length
    );
  });

  if (!canFitNormalOrientation && !canFitRotatedOrientation) {
    return false;
  }

  const totalAreaNeeded = vehicles.reduce(
    (sum, v) => sum + v.length * vehicleWidth * v.quantity,
    0
  );
  const listingArea = listing.length * listing.width;

  return listingArea >= totalAreaNeeded;
}

function findCheapestCombination(locationListings, vehicles) {
  locationListings.sort((a, b) => a.price_in_cents - b.price_in_cents);

  for (const listing of locationListings) {
    if (canFitVehicles(listing, vehicles)) {
      return { listingIds: [listing.id], totalPrice: listing.price_in_cents };
    }
  }

  for (let i = 0; i < locationListings.length; i++) {
    for (let j = i + 1; j < locationListings.length; j++) {
      const combination = [locationListings[i], locationListings[j]];
      if (canFitVehiclesInCombination(combination, vehicles)) {
        return {
          listingIds: [locationListings[i].id, locationListings[j].id],
          totalPrice:
            locationListings[i].price_in_cents +
            locationListings[j].price_in_cents,
        };
      }
    }
  }

  for (let i = 0; i < locationListings.length; i++) {
    for (let j = i + 1; j < locationListings.length; j++) {
      for (let k = j + 1; k < locationListings.length; k++) {
        const combination = [
          locationListings[i],
          locationListings[j],
          locationListings[k],
        ];
        if (canFitVehiclesInCombination(combination, vehicles)) {
          return {
            listingIds: [
              locationListings[i].id,
              locationListings[j].id,
              locationListings[k].id,
            ],
            totalPrice:
              locationListings[i].price_in_cents +
              locationListings[j].price_in_cents +
              locationListings[k].price_in_cents,
          };
        }
      }
    }
  }

  return null;
}

function canFitVehiclesInCombination(listings, vehicles) {
  const totalCombinedArea = listings.reduce(
    (sum, listing) => sum + listing.length * listing.width,
    0
  );

  const totalVehicleArea = vehicles.reduce(
    (sum, v) => sum + v.length * 10 * v.quantity,
    0
  );

  if (totalCombinedArea < totalVehicleArea) {
    return false;
  }

  for (const vehicleType of vehicles) {
    let canFitSomewhere = false;
    for (const listing of listings) {
      if (canFitVehicles(listing, [vehicleType])) {
        canFitSomewhere = true;
        break;
      }
    }
    if (!canFitSomewhere) {
      return false;
    }
  }

  return true;
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const vehicles = req.body;

    if (!Array.isArray(vehicles)) {
      res.status(400).json({ error: "Request body must be an array" });
      return;
    }

    const locations = {};
    listings.forEach((listing) => {
      const locationId = listing.location_id;

      if (!locations[locationId]) {
        locations[locationId] = [];
      }

      locations[locationId].push(listing);
    });

    const results = [];

    Object.entries(locations).forEach(([locationId, locationListings]) => {
      const result = findCheapestCombination(locationListings, vehicles);

      if (result) {
        results.push({
          location_id: locationId,
          listing_ids: result.listingIds,
          total_price_in_cents: result.totalPrice,
        });
      }
    });

    results.sort((a, b) => a.total_price_in_cents - b.total_price_in_cents);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
