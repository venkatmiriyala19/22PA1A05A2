import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import URLForm from "../components/URLForm";

function ShortenerPage() {
  const [forms, setForms] = useState([{}]);

  const addForm = () => {
    if (forms.length < 5) setForms([...forms, {}]);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      {forms.map((_, idx) => (
        <URLForm key={idx} />
      ))}
      <Button onClick={addForm} disabled={forms.length >= 5}>
        + Add another URL
      </Button>
    </Box>
  );
}

export default ShortenerPage;
