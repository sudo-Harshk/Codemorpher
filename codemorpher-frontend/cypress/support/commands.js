// Custom commands for CodeMorpher testing
Cypress.Commands.add('selectLanguage', (language) => {
    cy.get(`.lang-option[data-value="${language}"]`).click()
    cy.get(`.lang-option[data-value="${language}"]`).should('have.class', 'selected')
    cy.get('#targetLanguage').should('have.value', language)
  })
  
  Cypress.Commands.add('enterJavaCode', (code) => {
    cy.get('#javaCode').clear().type(code)
  })
  
  Cypress.Commands.add('translateCode', () => {
    cy.get('#translateButton').click()
  })
  
  Cypress.Commands.add('mockSuccessfulTranslation', (response = {}) => {
    const defaultResponse = {
      translatedCode: ['console.log("Hello World");'],
      debuggingSteps: ['Check syntax', 'Verify output'],
      algorithm: ['Initialize', 'Process', 'Output']
    }
    
    cy.intercept('POST', 'https://codemorpher-backend.onrender.com/translate', {
      statusCode: 200,
      body: { ...defaultResponse, ...response }
    }).as('translationRequest')
  })
  
  Cypress.Commands.add('mockFailedTranslation', (statusCode = 500, message = "Server error") => {
    cy.intercept('POST', 'https://codemorpher-backend.onrender.com/translate', {
      statusCode,
      body: { error: true, message }
    }).as('failedTranslation')
  })
  
  Cypress.Commands.add('verifyTranslationResult', (expectedCode) => {
    cy.get('#translatedCodeBlock').should('contain', expectedCode || 'Hello World')
    cy.get('.debug-list li').should('have.length.at.least', 1)
    cy.get('.algorithm-list li').should('have.length.at.least', 1)
  })
  
  Cypress.Commands.add('toggleSection', (sectionId) => {
    cy.get(`#${sectionId} .header`).click()
    cy.get(`#${sectionId}`).should('have.class', 'collapsed')
    cy.get(`#${sectionId} .header`).click()
    cy.get(`#${sectionId}`).should('not.have.class', 'collapsed')
  })
  
  Cypress.Commands.add('verifyLoadingState', () => {
    cy.get('#loadingOverlay').should('be.visible')
    cy.get('.spinner').should('be.visible')
    cy.get('.progress').should('be.visible')
    cy.get('#funFact').should('contain', 'Fun Fact:')
    cy.wait('@translationRequest')
    cy.get('#loadingOverlay').should('not.be.visible')
  })