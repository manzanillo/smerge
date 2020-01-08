const commitInit = () => {
    const commtit_btn = document.getElementsByName("commit-btn")[0];
    const commtit_input_field = document.getElementsByName("commtit_input_field")[0];
    console.log("BTN:\n");
    console.log(commtit_btn);
    console.log("INPUT_FIELD:\n");
    console.log(commtit_input_field);

    commtit_btn.addEventListener('click', () => {
        console.log(commtit_input_field.value);
    });
}


commitInit();

