var gui_boxes = []

class GameBox {
	constructor(value) {
	    this.value = value
		this.locked = false
		this.selected = false

		this.gui_button = document.createElement("button")
		this.gui_button.onclick = this.clicked.bind(this)
		this.gui_button.innerHTML = String(this.value)
		document.getElementById("box_buttons").appendChild(this.gui_button)
	}

	clicked() {
	    if (this.locked)
	        return
	    this.selected = !this.selected

	    this.update_gui_classes()
	}

    update_gui_classes() {
        if (this.locked)
            this.gui_button.className = "box_locked"
        else if (this.selected)
            this.gui_button.className = "box_selected"
        else
            this.gui_button.className = ""
    }
}

function handle_boxes(boxes) {

	if (boxes === null)
	    return

	if (gui_boxes.length === 0)
		for (var i = 1; i <= boxes.length; i++)
		    gui_boxes.push(new GameBox(i))

	for (var i = 0; i < gui_boxes.length; i++) {
	    gui_boxes[i].locked = boxes[i]
	    gui_boxes[i].update_gui_classes()
	}
}


key_handle_json = { //For every property of the get_state value passed in from backend, does the specified function
    "boxes":handle_boxes,
    "playerturn":(player)=>{_set_ids_html("playerturn","Current turn: " + player)},
    "target":function(target) {_set_ids_html("target","Current target: " + String(target))},
}


function _set_ids_html(id,html) {
    document.getElementById(id).innerHTML = html
}


function send_choices(choices) {
    socket.emit("game_action","boxes",choices)
}

function restart() {
    socket.emit("game_action","restart")
}

document.getElementById("submit").onclick = function() {
    let choices = []

    gui_boxes.forEach((a)=>{
        if (a.selected)
            choices.push(a.value)
        a.selected = false
        a.update_gui_classes()
    })

    send_choices(choices)
}

function cancel_reset() {
    _set_ids_html("wintext","")
    document.getElementById("restart").hidden = true
    document.getElementById("submit").hidden = false

}

document.getElementById("restart").onclick = function() {
    cancel_reset()
    restart()
}

socket.on("cancel_reset", ()=>{  // Theoreticaly you can do this using the gamestate but its good for an example
    cancel_reset()
})

socket.on('game_over',(name) => { // Both of these socket.ons could be made a single function using a "ended" perameter if using gamestate
    get_state()
    _set_ids_html("wintext",name + " Wins!")
    document.getElementById("restart").hidden = false
    document.getElementById("submit").hidden = true
})

get_state()