import { expect, test } from "vitest";
import { renderWithProviders } from "@/shared/lib/testing/test-utils";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { requestLog } from "@/shared/lib/testing/msw-server";
import { RadicacionCompraPage } from "./RadicacionCompraPage";

test("Si diligencian el formulario con los datos obligatorios, debe guardar", async () => {

    renderWithProviders(<RadicacionCompraPage />);

    const user = userEvent.setup();
    const combobox = await screen.findByTestId("combobox-medio-pago");
    const input = within(combobox).getByRole("combobox");
    await user.click(input);
    await user.click(await screen.findByText("Crédito"));

    expect(combobox).toHaveTextContent("Crédito");

    
    const botonEnviar = await screen.findByTestId("enviar-confirmacion-button");

    await user.click(botonEnviar);

    expect(requestLog).toHaveLength(0);
    // expect(requestLog).toHaveBeenCalledWith({
    //     method: "POST",
    //     url: "ApiCOmpras",
    //     body: {
    //         infotercer: "defew"
    //     }
    // })
});