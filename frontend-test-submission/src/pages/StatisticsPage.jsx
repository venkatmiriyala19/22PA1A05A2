import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

function StatisticsPage() {
  const [shortLinks, setShortLinks] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const stored = Object.values(localStorage)
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setShortLinks(stored);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const result = {};
      for (const link of shortLinks) {
        const code = link.shortLink.split("/").pop();
        try {
          const res = await axios.get(`${baseURL}shorturls/${code}`);
          result[code] = res.data;
        } catch {
          result[code] = null;
        }
      }
      setStats(result);
    };

    if (shortLinks.length > 0) fetchStats();
  }, [shortLinks]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>
      {shortLinks.map((link) => {
        const code = link.shortLink.split("/").pop();
        const data = stats[code];

        return (
          <Accordion key={code}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {link.shortLink} — Clicks: {data?.clickCount ?? 0}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Original:</strong> {link.original}
              </Typography>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(data?.createdAt).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Expires At:</strong>{" "}
                {new Date(data?.expiry).toLocaleString()}
              </Typography>
              <Typography mt={2} variant="h6">
                Click Logs:
              </Typography>
              <Stack spacing={1}>
                {(data?.clickLogs || []).map((log, i) => (
                  <Box key={i} sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      {new Date(log.timestamp).toLocaleString()} —{" "}
                      {log.referrer || "Direct"} from {log.geoLocation}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default StatisticsPage;
