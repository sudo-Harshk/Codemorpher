describe('Codemorpher - Responsive UI Test', () => {
    const viewports = [
      { device: 'iPhone X', width: 375, height: 812 },
      { device: 'iPad', width: 768, height: 1024 },
      { device: 'MacBook', width: 1440, height: 900 }
    ];
  
    viewports.forEach(({ device, width, height }) => {
      it(`should render properly on ${device}`, () => {
        cy.viewport(width, height);
        cy.visit('http://localhost:5500/codemorpher-frontend/public');
        cy.get('.header-with-logo').should('be.visible');
        cy.get('#translateButton').should('be.visible');
        cy.screenshot(`responsive-${device}`);
      });
    });
  });
  