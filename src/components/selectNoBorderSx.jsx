const selectNoBorderSx = {
  minWidth: 160,
  background: "#fff",
  border: "none",
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    border: "none",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& fieldset": {
    border: "none",
    borderRadius: 0,
  },
};

export default selectNoBorderSx;