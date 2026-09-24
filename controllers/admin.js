const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const AuditLog = require("../models/auditLog");

module.exports.dashboard = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const bookings = await Booking.find({ status: "confirmed" });
    const totalGMV = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).lean();
    const recentListings = await Listing.find().populate("owner", "username email").sort({ createdAt: -1 }).limit(10).lean();
    const recentBookings = await Booking.find().populate("listing guest").sort({ createdAt: -1 }).limit(10).lean();
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(15).lean();

    res.render("admin/dashboard.ejs", {
        totalUsers,
        totalListings,
        totalBookings,
        totalGMV,
        recentUsers,
        recentListings,
        recentBookings,
        auditLogs,
    });
};

module.exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    await AuditLog.create({
        actor: req.user._id,
        actorUsername: req.user.username,
        action: `UPDATED_USER_ROLE_TO_${role.toUpperCase()}`,
        entityType: "User",
        entityId: id,
        details: `Updated role of ${user.username} (${user.email}) to ${role}`,
        ip: req.ip,
    });

    req.flash("success", `Updated role for ${user.username} to ${role}.`);
    res.redirect("/admin");
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);

    if (listing) {
        await AuditLog.create({
            actor: req.user._id,
            actorUsername: req.user.username,
            action: "DELETED_LISTING_BY_ADMIN",
            entityType: "Listing",
            entityId: id,
            details: `Moderator removed listing '${listing.title}'`,
            ip: req.ip,
        });
    }

    req.flash("success", "Listing removed by administrator.");
    res.redirect("/admin");
};
