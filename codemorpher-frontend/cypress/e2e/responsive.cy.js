describe('Codemorpher - Responsive UI Test', () => {
  const viewports = [
    { device: 'iPhone X', width: 375, height: 812 }, 
    { device: 'iPhone 14 Pro', width: 393, height: 852 },
    { device: 'Pixel 6', width: 412, height: 915 }, 
    { device: 'iPad', width: 768, height: 1024 }, 
    { device: 'iPad Pro', width: 1024, height: 1366 }, 
    { device: 'MacBook', width: 1440, height: 900 }, 
    { device: 'Desktop 1080p', width: 1920, height: 1080 }, 
    { device: 'Desktop 4K', width: 3840, height: 2160 } 
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