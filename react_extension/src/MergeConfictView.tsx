import { useCallback, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg'
import './MergeConfictView.css'
import Split from 'react-split'
import { cloneDeep, debounce } from 'lodash';
import { Button, DefaultButton, Stack } from '@fluentui/react';
import SnapDiv from './SnapDiv';


function MergeConfictView() {

    return (
        <div className='merge_main_space' >
            <div className='merge_main_pane'>
                <SnapDiv></SnapDiv>
            </div>
        </div>
    )
}

export default MergeConfictView