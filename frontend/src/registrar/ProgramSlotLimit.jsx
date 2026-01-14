import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import {
    Box,
    Paper,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import SearchIcon from "@mui/icons-material/Search";

const generateSlotOptions = (start = 10, end = 500, step = 10) => {
    const options = [];
    for (let i = start; i <= end; i += step) {
        options.push(i);
    }
    return options;
};

const SLOT_OPTIONS = generateSlotOptions(10, 500, 10);


const ProgramSlotLimit = () => {
    const [yearId, setYearId] = useState("");
    const [programs, setPrograms] = useState([]);
    const [slots, setSlots] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [maxSlots, setMaxSlots] = useState("");

    const settings = useContext(SettingsContext);

    const [titleColor, setTitleColor] = useState("#000000");
    const [subtitleColor, setSubtitleColor] = useState("#555555");
    const [borderColor, setBorderColor] = useState("#000000");
    const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
    const [subButtonColor, setSubButtonColor] = useState("#ffffff");   // ✅ NEW
    const [stepperColor, setStepperColor] = useState("#000000");       // ✅ NEW

    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [shortTerm, setShortTerm] = useState("");
    const [campusAddress, setCampusAddress] = useState("");

    useEffect(() => {
        if (!settings) return;

        // 🎨 Colors
        if (settings.title_color) setTitleColor(settings.title_color);
        if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
        if (settings.border_color) setBorderColor(settings.border_color);
        if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
        if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);   // ✅ NEW
        if (settings.stepper_color) setStepperColor(settings.stepper_color);           // ✅ NEW

        // 🏫 Logo
        if (settings.logo_url) {
            setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
        } else {
            setFetchedLogo(EaristLogo);
        }

        // 🏷️ School Information
        if (settings.company_name) setCompanyName(settings.company_name);
        if (settings.short_term) setShortTerm(settings.short_term);
        if (settings.campus_address) setCampusAddress(settings.campus_address);

    }, [settings]);

    // 🔹 Authentication and access states
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const pageId = 110;

    const [employeeID, setEmployeeID] = useState("");

    useEffect(() => {

        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");
        const storedEmployeeID = localStorage.getItem("employee_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);
            setEmployeeID(storedEmployeeID);

            if (storedRole === "registrar") {
                checkAccess(storedEmployeeID);
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    const checkAccess = async (employeeID) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`);
            if (response.data && response.data.page_privilege === 1) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            if (error.response && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (yearId) fetchSlotSummary();
    }, [yearId]);

    const fetchPrograms = async () => {
        const res = await axios.get(`${API_BASE_URL}/api/programs`);
        setPrograms(res.data);
    };

    const fetchSlotSummary = async () => {
        const res = await axios.get(`${API_BASE_URL}/api/programs/availability/${yearId}`);
        setSlots(res.data);
    };

    const [schoolYears, setSchoolYears] = useState([]);

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    const fetchSchoolYears = async () => {
        const res = await axios.get(`${API_BASE_URL}/api/school-years`);
        setSchoolYears(res.data);

        // auto-select active year
        const active = res.data.find(y => y.status === 1);
        if (active) {
            setYearId(active.year_id);
        }
    };


    const saveSlotLimit = async () => {
        await axios.post(`${API_BASE_URL}/api/program-slots`, {
            year_id: yearId,
            program_id: selectedProgram,
            max_slots: maxSlots,
        });

        fetchSlotSummary();
        setSelectedProgram("");
        setMaxSlots("");
        setIsEditing(false);
    };


    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", pr: 2, mr: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: titleColor,
                    }}
                >
                    ADMISSION PROGRAM SLOT
                </Typography>

                <TextField
                    size="small"
                    placeholder="Search Program"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        width: 450,
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                        },
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                    }}
                />




            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />


            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid ${borderColor}`, }}>
                <Table>
                    <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2" }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: "Center" }}>Program Slot (Remaining)</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
            <Paper sx={{ p: 3, mb: 4, border: `2px solid ${borderColor}`, }}>
                <Box display="flex" gap={2}>
                    <FormControl fullWidth>
                        <Select
                            value={yearId}
                            onChange={(e) => setYearId(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">Select School Year</MenuItem>
                            {schoolYears.map((y) => (
                                <MenuItem key={y.year_id} value={y.year_id}>
                                    {y.year_description}
                                    {y.status === 1 ? " (ACTIVE)" : ""}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    <FormControl fullWidth>
                        <Select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">Select Program</MenuItem>
                            {programs.map((p) => (
                                <MenuItem key={p.program_id} value={p.program_id}>
                                    ({p.program_code}) {p.program_description} {p.program_major}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <Select
                            value={maxSlots}
                            onChange={(e) => setMaxSlots(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">Max Slots</MenuItem>
                            {SLOT_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            label="Max Slots"
                            type="number"
                            value={maxSlots}
                            onChange={(e) => setMaxSlots(Number(e.target.value))}
                            inputProps={{ min: 1 }}
                        />
                    </FormControl>


                    <Button
                        variant="contained"
                        onClick={saveSlotLimit}
                        disabled={!yearId || !selectedProgram || !maxSlots}
                    >
                        {isEditing ? "Update" : "Save"}
                    </Button>
                </Box>
            </Paper>

            {/* Slot Summary */}
            <Paper>
                <Table>
                    <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2", }}>
                        <TableRow>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Program</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Max Slots</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Applicants</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Remaining</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Status</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${borderColor}`, textAlign: "center" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {slots
                            .filter((row) =>
                                `${row.program_code} ${row.program_description} ${row.major}`
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                            )
                            .map((row) => {
                                const remaining = row.max_slots - row.total_applicants;
                                return (
                                    <TableRow
                                        key={row.program_id}
                                        sx={{
                                            backgroundColor: remaining <= 0 ? "#ffcccc" : "inherit", // light red if full
                                            "&:hover": {
                                                backgroundColor: remaining <= 0 ? "#ffbbbb" : "#f5f5f5", // slightly darker on hover
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ color: "black", border: `2px solid ${borderColor}`, textAlign: "left" }}>
                                            ({row.program_code}) {row.program_description} {row.major}
                                        </TableCell>
                                        <TableCell sx={{ color: "black", border: `2px solid ${borderColor}`, textAlign: "center" }}>{row.max_slots}</TableCell>
                                        <TableCell sx={{ color: "black", border: `2px solid ${borderColor}`, textAlign: "center" }}>{row.total_applicants}</TableCell>
                                        <TableCell sx={{ color: "black", border: `2px solid ${borderColor}`, textAlign: "center" }}>{remaining}</TableCell>
                                        <TableCell

                                            sx={{
                                                color: remaining <= 0 ? "red" : "green",
                                                fontWeight: "bold",
                                                border: `2px solid ${borderColor}`,
                                                textAlign: "center"
                                            }}
                                        >
                                            {remaining <= 0 ? "FULL" : "OPEN"}
                                        </TableCell>
                                        <TableCell sx={{ color: "black", border: `2px solid ${borderColor}`, textAlign: "center" }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: "green",
                                                    color: "white",


                                                }}
                                                onClick={() => {
                                                    setSelectedProgram(row.program_id);
                                                    setMaxSlots(row.max_slots);
                                                    setIsEditing(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ProgramSlotLimit;
