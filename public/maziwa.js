const searchbar= document.getElementById(`searchbar`);
const filterbtns=document.querySelectorAll(`.filter-btn`);
const icecreamcards=document.querySelectorAll(`.icecream-card`);
const icecreamcontainer=document.getElementById(`icc`);

/*WE use query selector all to make the objectsusing the class to appear as an array */
filterbtns.forEach(btn=>{
    btn.addEventListener(`click`, ()=>{
        document.querySelector(`.filter-btn.active`).classList.remove(`active`);
        btn.classList.add(`active`);
        const category=btn.getAttribute(`data-category`);

        
        icecreamcards.forEach(card=>{
            if (category==='all'||card.getAttribute(`data-category`)===category){
                card.style.display="block";

            }else{
                card.style.display=`none`;
            }
        });

    });
});

searchbar.addEventListener(`keyup`,e=>{
    const searchtext=e.target.value.toLowerCase().trim();
    
    
    icecreamcards.forEach(card=> {
        const name=card.querySelector(`h3`).textContent.toLowerCase();
        if(name.includes(searchtext)){
            card.style.display=`block`;
        }else{
            card.style.display=`none`;
            
            
        }
        
        
        /*card.style.display=name.includes(searchtext)?`block`:`none`;*/

    });
    
    
});

function savedname(){
    const name=document.getElementById(`name`).value;
    const email=document.getElementById(`email`).value;
    localStorage.setItem(`emaill`,email);
    localStorage.setItem('username',name);
}
window.onload=function(){
    const emailsaved=localStorage.getItem('emaill');
    document.getElementById(`email`).value=emailsaved;
    const namesaved=localStorage.getItem('username');
    document.getElementById(`name`).value=namesaved;
}

function togglemenu(){
    document.getElementById(`button`).classList.toggle(`open`);
    document.getElementById(`list`).classList.toggle('show');

}

document.addEventListener(`click`, function(e) {
    const menu=document.querySelector(`ul`);
    const button=document.getElementById(`button`);

    const clickoutside=!menu.contains(e.target) && e.target!==button;

    if(menu.classList.contains(`show`) && clickoutside){
        menu.classList.remove(`show`);
        button.classList.remove(`open`);
    }
});
function tosubmenu(){
    
    document.getElementById(`submenu`).classList.toggle(`show2`);
}
/*const searchhbar=document.getElementById(`searchbar`);
const fillterbtns=document.querySelectorAll(filter-btns);
const icecreamcard=document.querySelectorAll(ice-cream-card);

searchhbar.addEventListener(`keyup`,e=>{
    const searchtextt=e.target.value.toLowerCase();
    icecreamcard.forEach(card=>{
        const name=card.querySelector(`h3`).textContent.toLowerCase();
        if(name.includes(searchtextt)){
            card.style.display=`block`;
        }else{
            card.style.display=`none`;
        }
    });
});

fillterbtns.forEach(btn=>{
    btn.addEventListener(`onclick`,(){
        document.querySelector(`.filter-btn.active`).classList.remove(`.active`);
        btn.classList.add(`.active`);
        const categoryy=btn.getAttribute(`data-category`);

    icecreamcard.forEach(card =>{});
        if(categoryy===`all`||categoryy===card.getAttribute(`data-category`)){
            card.style.display=`block`;
        }else{
            card.style.display=`none`;
        }
    });
});*/