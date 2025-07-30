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
import { useParams, Link } from "react-router-dom";

const baseURL = process.env.REACT_APP_API_BASE_URL;

function StatisticsPage() {
  const { shortcode } = useParams(); // ✅ get from route if present
  const [shortLinks, setShortLinks] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!shortcode) {
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
    } else {
      setShortLinks([{ shortLink: `http://localhost:9003/${shortcode}` }]);
    }
  }, [shortcode]);

  useEffect(() => {
    const fetchStats = async () => {
      const result = {};
      for (const link of shortLinks) {
        const code = link.shortLink?.split("/")?.pop();
        if (!code) continue;
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
      {shortLinks
        .filter(
          (link) =>
            typeof link.shortLink === "string" && link.shortLink.includes("/")
        )
        .map((link) => {
          const code = link.shortLink.split("/").pop();
          const data = stats[code];

          return (
            <Accordion key={code} defaultExpanded={!!shortcode}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <Link
                    to={`/stats/${code}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {link.shortLink}
                  </Link>{" "}
                  — Clicks: {data?.clickCount ?? 0}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <strong>Original:</strong>{" "}
                  {data?.originalUrl || link.original}
                </Typography>
                <Typography>
                  <strong>Created At:</strong>{" "}
                  {data?.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "N/A"}
                </Typography>
                <Typography>
                  <strong>Expires At:</strong>{" "}
                  {data?.expiry
                    ? new Date(data.expiry).toLocaleString()
                    : "N/A"}
                </Typography>
                <Typography mt={2} variant="h6">
                  Click Logs:
                </Typography>
                <Stack spacing={1}>
                  {(data?.clicks || []).map((log, i) => (
                    <Box key={i} sx={{ pl: 2 }}>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()} —{" "}
                        {log.referrer || "Direct"} from{" "}
                        {log.location || "unknown"}
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
