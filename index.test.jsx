/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Booking from './src/views/Booking';
import Confirmation from './src/views/Confirmation';
import App from './src/App';
import userEvent from '@testing-library/user-event';
import { server } from './mocks/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

beforeEach(() => {
    server.listen()
});

afterEach(() => { 
    sessionStorage.clear();
    server.close();
    cleanup();
}) ;

describe('Does the test files setup properly', () => {
    it('should run this test as success allways', () => {
        expect(true).toBe(true);
    })
});

// TEST OF THE ACTUAL TESTCRITERIA.

describe('Som användare vill jag kunna boka datum och tid samt ange antal spelare så att jag kan reservera 1 eller flera baner i bowlinghallen. ', () => { 
    it('Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem.', async () => {
        render(<App />);
        const choosetime = screen.getByText('Time').parentElement.children[1];
        const chooseDate = screen.getByText('Date').parentElement.children[1];
        fireEvent.change(choosetime, {target: {value: '18:30'}});
        await userEvent.type(chooseDate, '2024-12-15');
        expect(choosetime.value).toBe('18:30');
        expect(chooseDate.value).toBe('2024-12-15');
    })
    it('Användaren ska kunna ange antal spelare (minst 1 spelare).', async () => {
        render(<App />);
        const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
        await userEvent.type(choosePlayers, '6');
        expect(choosePlayers.value).toBe('6');

        await userEvent.clear(choosePlayers);
        await userEvent.type(choosePlayers, '0');
        expect(choosePlayers.value).toBe('0');
        // Det sker inget felmeddelande när man skickar in 0 spelare
    });
    it('Användaren ska kunna reservera ett eller flera banor beroende på antal spelare.', async () => {
        render(<App />);
        const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];
        await userEvent.type(chooseLanes, '2');
        expect(chooseLanes.value).toBe('2');
    });
    it('VG - Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas', async () => {
        render(<App />);

        const choosetime = screen.getByText('Time').parentElement.children[1];
        const chooseDate = screen.getByText('Date').parentElement.children[1];
        const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
        const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];

        // Fill the fields one at the time and check the errormessage
        await userEvent.type(choosetime, '18:55');
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

        await userEvent.type(chooseDate, '2024-12-24');
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

        await userEvent.type(choosePlayers, '8');
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

        await userEvent.type(chooseLanes, '3');
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Antalet skor måste stämma överens med antal spelare')).toBeDefined();
        
        // Emptying fields to check that the error message works correctly
        await userEvent.clear(choosetime);
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

        await userEvent.clear(chooseDate);
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

        await userEvent.clear(choosePlayers);
        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();
    });

    it('VG - Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande.', async () => {
        render(<App />);
        
        const choosetime = screen.getByText('Time').parentElement.children[1];
        const chooseDate = screen.getByText('Date').parentElement.children[1];
        const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
        const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];

        await userEvent.type(choosetime, '18:55');
        await userEvent.type(chooseDate, '2024-12-24');
        await userEvent.type(choosePlayers, '8');
        await userEvent.type(chooseLanes, '1');

        const addButton = screen.getByText('+');
        for (let i = 0; i < 8; i++ ) {
            await userEvent.click(addButton);
            await userEvent.type(screen.getByText(`Shoe size / person ${i + 1}`).parentElement.children[1], '45');
        }

        await userEvent.click(screen.getByText('strIIIIIike!'));
        expect(screen.getByText('Det får max vara 4 spelare per bana')).toBeDefined();
    });
})

describe('Som användare vill jag kunna välja skostorlek för varje spelare så varje spelare får skor som passar.', () => {
    it(`Användaren ska kunna ange skostorlek för varje spelare.
        Användaren ska kunna ändra skostorlek för varje spelare.
        Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen.
        Systemet ska visa en översikt där användaren kan kontrollera de valda skostorlekarna för varje spelare innan bokningen slutförs.
        Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.`, 
    async () => {
        render(<App />);

        const allShoes = screen.getByText('Shoes').parentElement.parentElement;
        expect(allShoes.children.length).toBe(2);
        
        // add a player
        const addButton = screen.getByText('+');
        await userEvent.click(addButton);

        // set the size for the first player
        const chooseShoeSize = screen.getByText('Shoe size / person 1').parentElement.children[1];
        expect(chooseShoeSize).toBeDefined();
        await userEvent.type(chooseShoeSize, '45');
        expect(chooseShoeSize.value).toBe('45');
        
        // change the size of the first player
        await userEvent.clear(chooseShoeSize);
        expect(chooseShoeSize.value).toBe('');
        await userEvent.type(chooseShoeSize, '35');
        expect(chooseShoeSize.value).toBe('35');

        // add another player
        await userEvent.click(addButton);
        const chooseAnotherSize = screen.getByText('Shoe size / person 2').parentElement.children[1];
        await userEvent.type(chooseAnotherSize, '38');
        expect(chooseAnotherSize.value).toBe('38')


        // change the size of the second player
        await userEvent.clear(chooseAnotherSize);
        expect(chooseAnotherSize.value).toBe('');
        await userEvent.type(chooseAnotherSize, '42');
        expect(chooseAnotherSize.value).toBe('42');

        // there should now be two more elements in the shoes componenet, one for each shoe we added
        expect(allShoes.children.length).toBe(4);

        // now one shoe element should be removed
        const removeButtons = screen.getAllByText('-');
        await userEvent.click(removeButtons[0]);
        expect(allShoes.children.length).toBe(3);
    })
    it(`VG - Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande och be om att skostorleken anges. 
        VG - Om antalet personer och skor inte matchas ska ett felmeddelande visas.`,
    async () => {
        render(<App />);

        // Add player info for the shoe-test
        const choosetime = screen.getByText('Time').parentElement.children[1];
        const chooseDate = screen.getByText('Date').parentElement.children[1];
        const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
        const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];
        await userEvent.type(choosetime, '18:55');
        await userEvent.type(chooseDate, '2024-12-24');
        await userEvent.type(choosePlayers, '2');
        await userEvent.type(chooseLanes, '1');

        // add just one shoe for two players
        const addButton = screen.getByText('+');
        await userEvent.click(addButton);
        const chooseShoeSize = screen.getByText('Shoe size / person 1').parentElement.children[1];
        await userEvent.type(chooseShoeSize, '45');

        const confirmButton = screen.getByText('strIIIIIike!');
        expect(confirmButton).toBeDefined();
        await userEvent.click(confirmButton);
        expect(screen.getByText('Antalet skor måste stämma överens med antal spelare')).toBeDefined();

        // add another shoe, without specifying the size
        await userEvent.click(addButton);
        await userEvent.click(confirmButton);
        expect(screen.getByText('Alla skor måste vara ifyllda')).toBeDefined();
        
    })
})


describe('Som användare vill jag kunna skicka iväg min reservation och få tillbaka ett ett bokningsnummer och totalsumma så jag vet hur mycket jag ska betala. (120 kr / person + 100 kr / bana).', () => {
    it(`Användaren ska kunna slutföra bokningen genom att klicka på en "slutför bokning"-knapp.
        Systemet ska generera ett bokningsnummer och visa detta till användaren efter att bokningen är slutförd.
        Systemet ska beräkna och visa den totala summan för bokningen baserat på antalet spelare (120 kr per person) samt antalet reserverade banor (100 kr per bana).
        Den totala summan ska visas tydligt på bekräftelsesidan och inkludera en uppdelning mellan spelare och banor.
        Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn när bokningen är klar`, 
        async () => {
        render(<App />);

        // Add the info for testing confirmation
        await userEvent.type(screen.getByText('Time').parentElement.children[1], '18:55');
        await userEvent.type(screen.getByText('Date').parentElement.children[1], '2024-12-24');
        await userEvent.type(screen.getByText('Number of awesome bowlers').parentElement.children[1], '3');
        await userEvent.type(screen.getByText('Number of lanes').parentElement.children[1], '1');

        for ( let i = 0; i < 3; i++ ) {
            await userEvent.click(screen.getByText('+'));
            await userEvent.type(screen.getByText(`Shoe size / person ${i + 1}`).parentElement.children[1], '45');
        }

        expect(screen.queryByText('Det får max vara 4 spelare per bana')).not.toBeInTheDocument();
        expect(screen.queryByText('Alla fälten måste vara ifyllda')).not.toBeInTheDocument();
        expect(screen.queryByText('Alla skor måste vara ifyllda')).not.toBeInTheDocument();
        expect(screen.queryByText('Antalet skor måste stämma överens med antal spelare')).not.toBeInTheDocument();

        // click the confirm-button
        const confirmButton = screen.getByText('strIIIIIike!');
        await userEvent.click(confirmButton);
        expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation')

        const confirmWhen = screen.getByText('When').parentElement.children[1];
        const confirmWho = screen.getByText('Who').parentElement.children[1];
        const confirmLanes = screen.getByText('Lanes').parentElement.children[1];
        const confirmBookingId = screen.getByText('Booking number').parentElement.children[1];
        const confirmTotalPrice = screen.getByText('Total:').parentElement.children[1];
        expect(confirmWhen.value).toBe('2024-12-24 18:55');
        expect(confirmWho.value).toBe('3');
        expect(confirmLanes.value).toBe('1');
        expect(confirmBookingId.value).toBeDefined();

        const totalPrice = confirmTotalPrice.textContent.slice(0, -4);
        const expectedPrice = (Number(confirmLanes.value) * 100) + (Number(confirmWho.value) * 120);
        expect(Number(totalPrice)).toBeDefined(expectedPrice);

        // move back and forth between the booking and confirmation pages, and the data of the last booking should remain.
        fireEvent.click(screen.getAllByRole('img')[0]);
        fireEvent.click(screen.getByText('Booking'));
        expect(screen.getByRole('navigation').parentElement).toHaveClass('booking')

        await userEvent.click(screen.getAllByRole('img')[0]);
        await userEvent.click(screen.getByText('Confirmation'));
        expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation')

        expect(confirmWhen.value).toBe('2024-12-24 18:55');
        expect(confirmWho.value).toBe('3');
        expect(confirmLanes.value).toBe('1');
        expect(confirmBookingId.value).toBeDefined();
    
    })
})
describe('Som användare vill jag kunna navigera mellan boknings-och bekräftelsevyn.',  () => {
    it(` Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord eller finns i session storage ska texten "Ingen bokning gjord visas".`, 
    async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Booking />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByRole('navigation').parentElement).toHaveClass('booking');
        
        // visit confimation page before the booking is done        
        await userEvent.click(screen.getAllByRole('img')[0]);
        await userEvent.click(screen.getByText('Confirmation'));
        expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation')
        
        // there should be no data
        expect(screen.queryByText('When')).not.toBeInTheDocument();
        expect(screen.queryByText('Who')).not.toBeInTheDocument();
        expect(screen.queryByText('Lanes')).not.toBeInTheDocument();
        expect(screen.queryByText('Booking number')).not.toBeInTheDocument();

        // and errormessage
        expect(screen.getByText('Inga bokning gjord!')).toBeInTheDocument();

        // go back to booking page
        fireEvent.click(screen.getAllByRole('img')[0]);
        fireEvent.click(screen.getByText('Booking'));
        expect(screen.getByRole('navigation').parentElement).toHaveClass('booking')

        
    })
    it('Om användaren navigerar till bekräftelsevyn och det finns en bokning sparad i session storage ska denna visas.', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Booking />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        // set sessionStorage
        const confirmation = {
            when: '2025-01-01',
            lanes: '1',
            people: '1',
            shoes: ['42'],
            price: '220',
            id: 'test123'
        }
        sessionStorage.setItem("confirmation", JSON.stringify(confirmation));

        // now try confirmation page
        await userEvent.click(screen.getAllByRole('img')[0]);
        await userEvent.click(screen.getByText('Confirmation'));
        expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation');

        expect(screen.queryByText('When')).toBeInTheDocument();
        expect(screen.queryByText('Who')).toBeInTheDocument();
        expect(screen.queryByText('Lanes')).toBeInTheDocument();
        expect(screen.queryByText('Booking number')).toBeInTheDocument();

    })
})
