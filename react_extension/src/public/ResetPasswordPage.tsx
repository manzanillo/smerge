import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Footer from "../components/shared/Footer";
import {
    lightPageContainer,
    lightPageContent,
    lightTextFieldSx,
    primaryButtonSx,
} from "./publicPageStyles";
import {
    resetPasswordPublic,
    validateResetPasswordToken,
} from "../services/PublicProjectService";
import "./Base.css";

const ResetPasswordPage: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {token} = useParams<{ token: string }>();

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeated, setNewPasswordRepeated] = useState("");
    const [isTokenChecking, setIsTokenChecking] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function checkToken() {
            if (!token) {
                setIsTokenValid(false);
                setIsTokenChecking(false);
                return;
            }

            try {
                await validateResetPasswordToken(token);
                setIsTokenValid(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("reset_password.invalid_token"));
                setIsTokenValid(false);
            } finally {
                setIsTokenChecking(false);
            }
        }
        checkToken();
    }, [token, t]);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) {
            setError(t("reset_password.invalid_token"));
            return;
        }

        setError("");
        setSuccess(false);

        if (!newPassword || !newPasswordRepeated) {
            setError(t("reset_password.fill_both"));
            return;
        }

        if (newPassword !== newPasswordRepeated) {
            setError(t("reset_password.passwords_no_match"));
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPasswordPublic(token, {
                new_password: newPassword,
                new_password_repeated: newPasswordRepeated,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/open");
            }, 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("reset_password.error_generic"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={lightPageContainer}>
            <Box sx={lightPageContent}>
                <Container maxWidth="sm">
                    <Typography variant="h5" sx={{mb: 2}}>
                        {t("reset_password.title")}
                    </Typography>

                    {isTokenChecking ? (
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <CircularProgress size={22}/>
                            <Typography>{t("reset_password.checking_token")}</Typography>
                        </Box>
                    ) : null}

                    {!isTokenChecking && !isTokenValid ? (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error || t("reset_password.invalid_token")}
                        </Alert>
                    ) : null}

                    {!isTokenChecking && isTokenValid ? (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography paragraph sx={{mb: 2}}>
                                {t("reset_password.description")}
                            </Typography>

                            {error ? (
                                <Alert severity="error" sx={{mb: 2}}>
                                    {error}
                                </Alert>
                            ) : null}

                            {success ? (
                                <Alert severity="success" sx={{mb: 2}}>
                                    {t("reset_password.success")}
                                </Alert>
                            ) : null}

                            <TextField
                                fullWidth
                                required
                                type="password"
                                label={t("reset_password.new_password")}
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                sx={{...lightTextFieldSx, mb: 2}}
                            />

                            <TextField
                                fullWidth
                                required
                                type="password"
                                label={t("reset_password.new_password_repeated")}
                                value={newPasswordRepeated}
                                onChange={(event) => setNewPasswordRepeated(event.target.value)}
                                sx={{...lightTextFieldSx, mb: 2}}
                            />

                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <Button variant="text" onClick={() => navigate("/open")} sx={{color: "#666"}}>
                                    {t("reset_password.back")}
                                </Button>
                                <Button type="submit" variant="contained" disabled={isSubmitting} sx={primaryButtonSx}>
                                    {t("reset_password.submit")}
                                </Button>
                            </Box>
                        </Box>
                    ) : null}
                </Container>
            </Box>
            <Footer/>
        </Box>
    );
};

export default ResetPasswordPage;

