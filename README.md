## Features
 - Tags: On bottom right, while logged in, you can click "Create Tag" to create a tag with a name and a hex code color. These tags are user-specific and can't be used by other users unless a user shares an event with them. Users can type the tag name in when they create or edit an event to apply the tag. Tags are stored in the tag table in the calendar MySQL schema.
  - Share calendar: Users can share their entire calendar by clicking the share button in bottom left. They can type in the username that they want to share their calendar with. All new events added by this user as well as old events will be visible on the shared user's screen.
   - Group events: In the event creation form, users can type in the name of user's they want to add to the event in the format "user1, user2, user3" (no quotations). For each user added, a row will be added to the groupevent table with an event_id and user_id. When the users who were added to the event load their calendar, they will be able to see and make edits to this event.
   - Calendar defaults to the actual current month and highlights the cell of the current day in blue.
# jscalendarpublic
