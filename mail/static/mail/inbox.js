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
  document.querySelector('#display-view').style.display = 'none';
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

//Add function to create div in inbox.html to display email clicked on
function display_mail(emailId) {
  //Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //Clear the div view
  document.querySelector('#display-view').innerHTML = '';
  //Update email read status 
  fetch(`/emails/${emailId}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
  //Show the email
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(emails => {
      const replyBtn = document.createElement('button');
      replyBtn.id = "replyBtn";
      const mailDisplay = document.createElement('div');
      mailDisplay.id = "mailDisplay";
      mailDisplay.innerHTML += "<h4>" + emails.sender + "</h4>" +
      "<small>" + emails.recipients + "</small>" + 
      "<small>" + emails.timestamp + "</small>" +
      "<h4>" + emails.subject + "</h4>" +
      "<p>" + emails.body + "</p>";
      mailDisplay.appendChild(replyBtn);
      replyBtn.addEventListener('click', function() {
        //Show compose view and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#display-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';

        //Prefill composition form fields
        document.querySelector('#compose-recipients').value = `${emails.sender}`;
        document.querySelector('#compose-subject').value = `Re: ${emails.subject}`;
        document.querySelector('#compose-body').value = `Date: ${emails.timestamp}` +
        "<br>" + `${emails.sender} wrote:` + 
        "<br>" + `${emails.body}`;

        //Submit the email form
        document.querySelector("#compose-form").onsubmit = () => {
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
        }
      })   
    document.querySelector('#display-view').append(mailDisplay);
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //GET all of the currently logged in user's mail
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      //Log emails to console
      console.log(emails);
      // Show the emails in the inbox
      //forEach on each item returned from mailbox GET request
      for (email in emails) {
        JSON.parse(email);
        //Create an archive email btn
        const archiveBtn = document.createElement('button');
        archiveBtn.id = "archiveBtn";

        //Create a div for inbox email
        const mailItem = document.createElement('div');
        mailItem.id = "mailItem";
        email = emails[email];
        emailId = parseInt(email.id);

        mailItem.innerHTML += "<h6>" + email.sender + "</h6>" +
        "<p>" + email.subject + "</p>" + "<small>" + 
        email.timestamp + "</small>";
        
        //Append the archive btn if not in Sent mailbox
        if (`${mailbox}` != 'sent') {
          mailItem.appendChild(archiveBtn);
        }

        //Set bg colour depending on read status
        if (email.read === false) {
          mailItem.style.backgroundColor = "white";
        }
        else {
          mailItem.style.backgroundColor = "gray";
        }

        //Add event listener to open clicked email
        mailItem.addEventListener('click', function() {
          display_mail(emailId);
        });

        //Add event listener to archive email when archiveBtn clicked
        archiveBtn.addEventListener('click', function() {
          fetch(`/emails/${emailId}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: !archived
            })
          })
        })

        document.querySelector('#emails-view').append(mailItem);
      }       
  })
}
