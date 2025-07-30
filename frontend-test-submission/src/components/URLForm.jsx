import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function URLForm() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!isValidUrl(url)) newErrors.url = "Invalid URL";
    if (validity && (!Number.isInteger(+validity) || +validity <= 0))
      newErrors.validity = "Validity must be a positive integer";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post(`${baseURL}shorturls`, {
        url,
        validity: validity ? parseInt(validity) : undefined,
        shortcode: shortcode || undefined,
      });

      setResult(res.data);
      localStorage.setItem(
        res.data.shortLink,
        JSON.stringify({ ...res.data, original: url })
      );
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Paper sx={{ p: 3, my: 2 }}>
      <Stack spacing={2}>
        <TextField
          label="Long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!errors.url}
          helperText={errors.url}
          fullWidth
        />
        <TextField
          label="Validity (minutes)"
          value={validity}
          onChange={(e) => setValidity(e.target.value)}
          error={!!errors.validity}
          helperText={errors.validity}
          fullWidth
        />
        <TextField
          label="Preferred Shortcode"
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit}>
          Shorten
        </Button>
        {result && (
          <Box>
            <Typography>
              <strong>Short Link:</strong>{" "}
              <a href={result.shortLink} target="_blank" rel="noreferrer">
                {result.shortLink}
              </a>
            </Typography>
            <Typography>
              <strong>Expires:</strong>{" "}
              {new Date(result.expiry).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
