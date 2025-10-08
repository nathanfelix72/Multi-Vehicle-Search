const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const listings = JSON.parse(fs.readFileSync("listings.json", "utf8"));

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

app.post("/", (req, res) => {
	const vehicles = req.body;

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

	res.json(results);
});

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

// Export for Vercel
module.exports = app;
