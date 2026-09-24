const { describe, it } = require("node:test");
const assert = require("node:assert");
const bookingService = require("../services/bookingService");

describe("Booking Pricing Engine", () => {
    it("should accurately calculate stay pricing with taxes and fees", () => {
        const nightlyRate = 1000;
        const checkInDate = new Date("2026-10-01");
        const checkOutDate = new Date("2026-10-04"); // 3 nights

        const pricing = bookingService.calculatePricing({
            nightlyRate,
            checkInDate,
            checkOutDate,
        });

        assert.strictEqual(pricing.nights, 3);
        assert.strictEqual(pricing.totalNightsPrice, 3000);
        assert.strictEqual(pricing.cleaningFee, 500);
        assert.strictEqual(pricing.serviceFee, 300);

        // Taxes: (3000 + 500 + 300) * 0.18 = 3800 * 0.18 = 684
        assert.strictEqual(pricing.taxes, 684);
        assert.strictEqual(pricing.total, 3000 + 500 + 300 + 684);
    });

    it("should throw an error if checkout is not after check-in", () => {
        const nightlyRate = 1000;
        const checkInDate = new Date("2026-10-05");
        const checkOutDate = new Date("2026-10-02");

        assert.throws(() => {
            bookingService.calculatePricing({
                nightlyRate,
                checkInDate,
                checkOutDate,
            });
        }, /Checkout date must be after check-in date/);
    });
});
