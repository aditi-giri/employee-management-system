import React, { useEffect, useState } from "react";
import Topbar from "../components/layout/Topbar";
import { getMyProfile, uploadProfileImage } from "../services/profileService";
import api from "../api/api";
import "./MyProfile.css";

const MyProfile = () => {
    const role = localStorage.getItem("role");

    const [profile, setProfile] = useState(null);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        phone: "",
        address: "",
    });
    const [showSalaryCard, setShowSalaryCard] = useState(false);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");





    const getSalaryBreakdown = (salary = 0) => {
        return {
            basic: salary * 0.5,
            hra: salary * 0.2,
            allowance: salary * 0.2,
            deductions: salary * 0.1,
            net: salary * 0.9,
        };
    };



    // ================= LOAD PROFILE =================
    useEffect(() => {
        getMyProfile()
            .then((res) => {
                setProfile(res.data);
                setFormData({
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ================= IMAGE UPLOAD =================
    const handleUpload = async () => {
        if (!image) return;

        await uploadProfileImage(image);
        const refreshed = await getMyProfile();
        setProfile(refreshed.data);
        setImage(null);
    };

    // ================= FORM =================
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async () => {
        try {
            await api.put(`/employee/updateEmployee/${profile.employeeId}`, {
                phone: formData.phone,
                address: formData.address,
            });

            const refreshed = await getMyProfile();
            setProfile(refreshed.data);
            setEditMode(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdatePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (passwordData.currentPassword === ""|| passwordData.confirmPassword==="" || passwordData.newPassword==="" ){
            setPasswordError("All fields are mandatory");
            return;
        }
        // ❌ new password same as current
        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError("New password cannot be the same as current password.");
            return;
        }

        

        // ❌ new & confirm mismatch
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            await api.post("/employee/changePassword", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setPasswordSuccess("Password updated successfully.");

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess("");
            }, 2000);

        } catch (err) {
            setPasswordError(
                err?.response?.data?.message || "Current password is incorrect."
            );
        }
    };



    if (loading) return <p className="text-center mt-4">Loading profile...</p>;
    if (!profile) return null;

    const defaultImage =
        "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

    return (
        <>
            <Topbar title="My Profile" />

            <div className="profile-container">
                <div className="profile-card">

                    {/* ================= PROFILE IMAGE ================= */}
                    <div className="profile-image">
                        <div className="image-wrapper">
                            <img
                                src={
                                    profile.profileImage
                                        ? `http://localhost:8083${profile.profileImage}`
                                        : defaultImage
                                }
                                alt="Profile"
                            />


                            <label className="image-overlay">
                                ✎ Change
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => setImage(e.target.files[0])}
                                />
                            </label>

                        </div>

                        {image && (
                            <button className="upload-btn" onClick={handleUpload}>
                                Save Photo
                            </button>
                        )}
                    </div>

                    {/* ================= DETAILS ================= */}
                    <div className="profile-details">
                        <h4>{profile.firstName} {profile.lastName}</h4>

                        <p><strong>Role:</strong> {profile.role.roleName}</p>
                        <p><strong>Department:</strong> {profile.department?.departmentName}</p>
                        <p><strong>Designation:</strong> {profile.designation}</p>

                        {role !== "SUPERADMIN" && !editMode && (
                            <>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Phone:</strong> {profile.phone || "—"}</p>
                                <p><strong>Address:</strong> {profile.address || "—"}</p>
                                <p className="salary-row">
                                    <strong>Salary:</strong> ₹{profile.salary}

                                    <button
                                        className="salary-breakdown-btn"
                                        onClick={() => setShowSalaryCard(true)}
                                    >
                                        View Breakdown
                                    </button>
                                </p>



                                <button
                                    className="edit-profile-btn"
                                    onClick={() => setEditMode(true)}
                                >
                                    Update Profile
                                </button>
                            </>
                        )}

                        <button
                            className="edit-profile-btn"
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            Change Password
                        </button>

                        {showPasswordForm && (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>

                                {passwordError && (
                                    <p style={{color:'red'}} className="form-error-text">{passwordError}</p>
                                )}

                                {passwordSuccess && (
                                    <p style={{color:'green'}}className="form-success-text">{passwordSuccess}</p>
                                )}


                                <div className="form-actions">
                                    <button className="save-btn" onClick={handleUpdatePassword}>
                                        Update Password
                                    </button>

                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowPasswordForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}


                        {showSalaryCard && (
                            <div
                                className="salary-overlay"
                                onClick={() => setShowSalaryCard(false)}
                            >
                                <div
                                    className="salary-card"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="salary-card-header">
                                        <h6>Salary Breakdown</h6>
                                        <span
                                            className="close-btn"
                                            onClick={() => setShowSalaryCard(false)}
                                        >
                                            ✕
                                        </span>
                                    </div>

                                    {(() => {
                                        const s = getSalaryBreakdown(profile.salary);
                                        return (
                                            <ul className="salary-list">
                                                <li><span>Basic</span><span>₹{s.basic}</span></li>
                                                <li><span>HRA</span><span>₹{s.hra}</span></li>
                                                <li><span>Allowance</span><span>₹{s.allowance}</span></li>
                                                <li><span>Deductions</span><span>-₹{s.deductions}</span></li>
                                                <hr />
                                                <li className="net">
                                                    <span>Net Salary</span>
                                                    <span>₹{s.net}</span>
                                                </li>
                                            </ul>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}


                        {/* ================= EDIT FORM ================= */}
                        {editMode && role !== "SUPERADMIN" && (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button className="save-btn" onClick={handleUpdateProfile}>
                                        Save Changes
                                    </button>

                                    <button
                                        className="cancel-btn"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>



                </div>
            </div>
        </>
    );
};

export default MyProfile;
