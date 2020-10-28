function JoinRoom()
{
    var roomId = document.getElementById("roomIdField").value;
    if(roomId.length > 0)
    {
        window.location.href = window.location.href + "room=" + roomId;
        //window.location.href = window.location.href + "room/";
    }

    else
    {
        CreateRoom();
    }
}

function CreateRoom()
{
    window.location.href = window.location.href + "room";
}

function Disconnect()
{
    window.location.href = "/";
}