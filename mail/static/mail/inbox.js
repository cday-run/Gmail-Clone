document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Submit the email form
  document.querySelector("#compose-form").onsubmit = () => {
    //Select the form content 
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    //Submit POST request to server
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    // Log server response to the console
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });
  }

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //GET all of the currently logged in user's mail
  //Need to change 'inbox' to be dynamic to inbox/sent/archived
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      //Log emails to console
      //console.log(emails);
      // Show the emails in the inbox
      //forEach on each item returned from mailbox GET request
      for (email in emails) {
        JSON.parse(email);
        const mailItem = document.createElement('div');
        mailItem.id = "mailItem";
        mailItem.innerHTML += "<h6>" + emails[email].sender + "</h6>" +
        "<p>" + emails[email].subject + "</p>" + "<small>" + 
        emails[email].timestamp + "</small>";
        mailItem.addEventListener('click', function() {
          console.log('clicked')
        });
        if (emails[email].read === false) {
          mailItem.style.backgroundColor = "white";
        }
        else {
          mailItem.style.backgroundColor = "gray";
        }
        document.querySelector('#emails-view').append(mailItem);
      }       
  })
}
