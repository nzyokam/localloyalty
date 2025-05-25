import React, { useState } from "react";
import {
  Phone,
  Star,
  Gift,
  Store,
  Users,
  Award,
  TrendingUp,
  Bell,
  Loader,
  UserPlus,
} from "lucide-react";
import { dbHelpers, visitHelpers } from "./lib/supabase";

// Registration Modal Component
const RegistrationModal = ({ userType, phoneNumber, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("salon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (userType === "business" && (!businessName.trim() || !businessType)) {
      setError("Please enter business details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (userType === "customer") {
        const { data, error } = await dbHelpers.createCustomer(
          phoneNumber,
          name
        );
        if (error) throw error;
        onSuccess(data, "customer");
      } else {
        const { data, error } = await dbHelpers.createBusiness(
          phoneNumber,
          businessName,
          businessType
        );
        if (error) throw error;
        onSuccess(data, "business");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Registration
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {userType === "business" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="salon">Salon</option>
                  <option value="barbershop">Barbershop</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="spa">Spa</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Check-in Modal Component
const CheckInModal = ({ businessData, onClose, onSuccess }) => {
  const [customerPhone, setCustomerPhone] = useState("");
  const [pointsToEarn, setPointsToEarn] = useState(
    businessData?.points_per_visit || 10
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await visitHelpers.checkInCustomer(
        customerPhone,
        businessData.id,
        pointsToEarn
      );

      if (error) throw error;

      setSuccess("✅ Customer checked in successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Check-in error:", error);
      setError(error.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Customer Check-in
        </h2>

        <form onSubmit={handleCheckIn}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Customer Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Customer must be registered first
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Points to Award
            </label>
            <input
              type="number"
              value={pointsToEarn}
              onChange={(e) => setPointsToEarn(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2" />
                  Check In
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Landing Page Component
const LandingPage = ({ phoneNumber, setPhoneNumber, handleLogin, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
    <div className="container mx-auto px-4 py-8">
      <div className="text-center text-white mb-12">
        <div className="flex items-center justify-center mb-6">
          <Award className="w-12 h-12 mr-3" />
          <h1 className="text-4xl font-bold">Local Loyalty</h1>
        </div>
        <p className="text-xl opacity-90">
          Reward Your Loyal Customers, Grow Your Business
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Get Started
        </h2>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+254 712 345 678"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoComplete="tel"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin("customer")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            disabled={loading || phoneNumber.length < 10}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                I'm a Customer
              </>
            )}
          </button>

          <button
            onClick={() => handleLogin("business")}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            disabled={loading || phoneNumber.length < 10}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Store className="w-5 h-5 mr-2" />
                I'm a Business Owner
              </>
            )}
          </button>
        </div>

        {phoneNumber.length > 0 && phoneNumber.length < 10 && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Please enter a valid phone number
          </p>
        )}
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <img className="w-8 h-8" src="/phone.svg"/>
          </div>
          <h3 className="text-lg font-semibold mb-2">Simple Registration</h3>
          <p className="opacity-90">
            Just your phone number - no complicated forms
          </p>
        </div>

        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <img className="w-8 h-8" src="/star.svg" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Earn Points</h3>
          <p className="opacity-90">
            Get rewarded for every visit to your favorite places
          </p>
        </div>

        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <img className="w-8 h-8" src="/gift.svg"/>
          </div>
          <h3 className="text-lg font-semibold mb-2">Redeem Rewards</h3>
          <p className="opacity-90">
            Exchange points for discounts and free services
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Customer Dashboard Component
const CustomerDashboard = ({
  customerData,
  customerPoints,
  rewards,
  aiInsights,
  isLoadingInsights,
}) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {customerData.name}!
            </h1>
            <p className="opacity-90">
              Member since{" "}
              {new Date(customerData.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {customerPoints?.available_points || 0}
            </div>
            <div className="text-sm opacity-90">Available Points</div>
          </div>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {customerPoints?.total_visits || 0}
              </div>
              <div className="text-gray-600">Total Visits</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {customerPoints?.total_points_earned || 0}
              </div>
              <div className="text-gray-600">Total Points Earned</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {rewards?.filter(
                  (r) =>
                    (customerPoints?.available_points || 0) >= r.points_required
                ).length || 0}
              </div>
              <div className="text-gray-600">Available Rewards</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Available Rewards
        </h2>
        {rewards && rewards.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎁</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reward.points_required} points required
                      </p>
                      {reward.businesses && (
                        <p className="text-xs text-gray-500">
                          at {reward.businesses.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      (customerPoints?.available_points || 0) >=
                      reward.points_required
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={
                      (customerPoints?.available_points || 0) <
                      reward.points_required
                    }
                  >
                    {(customerPoints?.available_points || 0) >=
                    reward.points_required
                      ? "Redeem"
                      : "Not enough points"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              No rewards available yet. Start visiting businesses to earn
              points!
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            AI-Powered Insights
          </h2>
          <div className="flex items-center text-purple-600">
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
        </div>
        {isLoadingInsights ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing your data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500"
                >
                  <span className="text-lg mr-3">{insight.split(" ")[0]}</span>
                  <p className="text-gray-700 flex-1">
                    {insight.substring(insight.indexOf(" ") + 1)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Start earning points to get personalized AI insights!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Business Dashboard Component
const BusinessDashboard = ({
  businessData,
  businessAnalytics,
  aiInsights,
  isLoadingInsights,
  onCheckInClick, // THIS WAS MISSING!
  recentVisits = [],
}) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{businessData.name}</h1>
            <p className="opacity-90">
              {businessData.type} • Business Dashboard
            </p>
          </div>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </button>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {businessAnalytics?.total_customers || 0}
              </div>
              <div className="text-gray-600">Total Customers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {businessAnalytics?.total_visits || 0}
              </div>
              <div className="text-gray-600">Total Visits</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(
                  businessAnalytics?.avg_points_per_visit ||
                    businessData?.points_per_visit ||
                    10
                )}
              </div>
              <div className="text-gray-600">Points Per Visit</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {businessAnalytics?.total_redemptions || 0}
              </div>
              <div className="text-gray-600">Rewards Redeemed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={onCheckInClick} // THIS IS THE KEY!
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Star className="w-5 h-5 mr-2" />
              Check-in Customer
            </button>
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
              Send Promotion
            </button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
              Manage Rewards
            </button>
            <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
              View Analytics
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Check-ins
          </h2>
          {recentVisits && recentVisits.length > 0 ? (
            <div className="space-y-3">
              {recentVisits.slice(0, 5).map((visit, index) => (
                <div
                  key={visit.id || index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {visit.customers?.name?.charAt(0) || "?"}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {visit.customers?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(visit.visit_date).toLocaleDateString()} •{" "}
                        {visit.points_earned} pts
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-medium">
                      +{visit.points_earned}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customer visits yet.</p>
              <p className="text-sm">
                Start checking in customers to see activity here!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            AI Business Insights
          </h2>
          <div className="flex items-center text-orange-600">
            <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm font-medium">Claude AI Assistant</span>
          </div>
        </div>
        {isLoadingInsights ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              AI is analyzing your business data...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500"
                >
                  <span className="text-xl mr-3">{insight.split(" ")[0]}</span>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2">
                      {insight.substring(insight.indexOf(" ") + 1)}
                    </p>
                    <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                      Take Action →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  Get more customers to receive AI-powered business insights!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationType, setRegistrationType] = useState(null);

  // Check-in modal state - THIS WAS MISSING!
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [recentVisits, setRecentVisits] = useState([]);

  // Data states
  const [customerData, setCustomerData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [customerPoints, setCustomerPoints] = useState(null);
  const [businessAnalytics, setBusinessAnalytics] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [error, setError] = useState("");

  // AI-powered insights function
  const generateAIInsights = (userData, type) => {
    setIsLoadingInsights(true);
    setTimeout(() => {
      if (type === "customer") {
        const points = customerPoints?.available_points || 0;
        const visits = customerPoints?.total_visits || 0;

        setAiInsights([
          `🎯 You have ${points} points! ${
            points >= 50
              ? "You can redeem rewards now!"
              : `Just ${50 - points} more points to your first reward.`
          }`,
          `📈 You've made ${visits} visits. ${
            visits >= 5
              ? "You're a loyal customer!"
              : "Keep visiting to unlock more benefits!"
          }`,
          `💡 Based on your activity, Thursday afternoons might be the best time for deals!`,
          `🌟 You're building great loyalty! Consider trying our premium services.`,
        ]);
      } else {
        const customers = businessAnalytics?.total_customers || 0;
        const visits = businessAnalytics?.total_visits || 0;

        setAiInsights([
          `📈 You have ${customers} customers and ${visits} total visits. ${
            customers > 10
              ? "Great engagement!"
              : "Focus on customer acquisition."
          }`,
          `🎯 ${
            customers > 0
              ? "Send personalized offers to increase return visits."
              : "Start by getting your first customers!"
          }`,
          `💡 Consider implementing a referral program to grow your customer base.`,
          `🌟 Reward your most loyal customers with exclusive perks to increase retention.`,
        ]);
      }
      setIsLoadingInsights(false);
    }, 2000);
  };

  // Load recent visits for business
  const loadRecentVisits = async (businessId) => {
    try {
      const { data, error } = await visitHelpers.getRecentVisits(
        businessId,
        10
      );
      if (error) throw error;
      setRecentVisits(data || []);
    } catch (error) {
      console.error("Load recent visits error:", error);
    }
  };

  const handleLogin = async (type) => {
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (type === "customer") {
        // Check if customer exists
        const { data: customer } = await dbHelpers.getCustomerByPhone(
          phoneNumber
        );

        if (customer) {
          // Existing customer - load their data
          setCustomerData(customer);

          // Load customer points
          const { data: points } = await dbHelpers.getCustomerPoints(
            phoneNumber
          );
          setCustomerPoints(points);

          // Load available rewards
          const { data: allRewards } = await dbHelpers.getAllActiveRewards();
          setRewards(allRewards || []);

          setCurrentView("customer-dashboard");
          generateAIInsights(customer, "customer");
        } else {
          // New customer - show registration
          setRegistrationType("customer");
          setShowRegistration(true);
        }
      } else {
        // Check if business exists
        const { data: business } = await dbHelpers.getBusinessByPhone(
          phoneNumber
        );

        if (business) {
          // Existing business - load their data
          setBusinessData(business);

          // Load business analytics
          const { data: analytics } = await dbHelpers.getBusinessAnalytics(
            phoneNumber
          );
          setBusinessAnalytics(analytics);

          // Load recent visits
          await loadRecentVisits(business.id);

          setCurrentView("business-dashboard");
          generateAIInsights(business, "business");
        } else {
          // New business - show registration
          setRegistrationType("business");
          setShowRegistration(true);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = async (data, type) => {
    setShowRegistration(false);

    if (type === "customer") {
      setCustomerData(data);

      // Load customer points (will be empty for new customer)
      const { data: points } = await dbHelpers.getCustomerPoints(phoneNumber);
      setCustomerPoints(points);

      // Load available rewards
      const { data: allRewards } = await dbHelpers.getAllActiveRewards();
      setRewards(allRewards || []);

      setCurrentView("customer-dashboard");
      generateAIInsights(data, "customer");
    } else {
      setBusinessData(data);

      // Load business analytics (will be empty for new business)
      const { data: analytics } = await dbHelpers.getBusinessAnalytics(
        phoneNumber
      );
      setBusinessAnalytics(analytics);

      // Load recent visits
      await loadRecentVisits(data.id);

      setCurrentView("business-dashboard");
      generateAIInsights(data, "business");
    }
  };

  const handleRegistrationClose = () => {
    setShowRegistration(false);
    setRegistrationType(null);
  };

  // Check-in handlers - THIS WAS MISSING!
  const handleCheckInClick = () => {
    setShowCheckIn(true);
  };

  const handleCheckInSuccess = async () => {
    // Refresh business analytics and recent visits after successful check-in
    if (businessData) {
      const { data: analytics } = await dbHelpers.getBusinessAnalytics(
        phoneNumber
      );
      setBusinessAnalytics(analytics);
      await loadRecentVisits(businessData.id);
    }
  };

  const handleCheckInClose = () => {
    setShowCheckIn(false);
  };

  // Render based on current view
  if (currentView === "customer-dashboard") {
    return (
      <CustomerDashboard
        customerData={customerData}
        customerPoints={customerPoints}
        rewards={rewards}
        aiInsights={aiInsights}
        isLoadingInsights={isLoadingInsights}
      />
    );
  }

  if (currentView === "business-dashboard") {
    return (
      <>
        <BusinessDashboard
          businessData={businessData}
          businessAnalytics={businessAnalytics}
          aiInsights={aiInsights}
          isLoadingInsights={isLoadingInsights}
          onCheckInClick={handleCheckInClick} // THIS WAS MISSING!
          recentVisits={recentVisits}
        />

        {/* Check-in Modal - THIS WAS MISSING! */}
        {showCheckIn && (
          <CheckInModal
            businessData={businessData}
            onClose={handleCheckInClose}
            onSuccess={handleCheckInSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <LandingPage
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        handleLogin={handleLogin}
        loading={loading}
      />

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {showRegistration && (
        <RegistrationModal
          userType={registrationType}
          phoneNumber={phoneNumber}
          onClose={handleRegistrationClose}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </>
  );
}

export default App;
