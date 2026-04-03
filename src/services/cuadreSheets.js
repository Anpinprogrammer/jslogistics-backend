const { sheets } = require("./googleSheets.js");

const SPREADSHEET_ID = "1XNWsEq6LHWwvU0ghTbhuaQ39Yt76IgzuxECwYGx8vnQ";



const enviarCuadre = async (data) => {
    console.log(data)
  const values = [
    [
      data.fecha,
      data.cuenta,
      data.monto,
      data.egresos
    ]
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Caja!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values
    }
  });
};

const liquidarCliente = async (data) => {
    
}

module.exports = { enviarCuadre };
